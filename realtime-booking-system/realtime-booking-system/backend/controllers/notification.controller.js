const deviceTokenModel = require('../models/device_token.model');
const firebaseService = require('../utils/firebase');

// Đăng ký token thiết bị
exports.registerDeviceToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, deviceInfo } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token thiết bị là bắt buộc' });
    }

    const tokenId = await deviceTokenModel.saveDeviceToken(userId, token, deviceInfo || {});
    
    res.status(201).json({
      message: 'Đăng ký token thiết bị thành công',
      tokenId
    });
  } catch (error) {
    console.error('Lỗi đăng ký token thiết bị:', error);
    res.status(500).json({ error: 'Lỗi server khi đăng ký token thiết bị' });
  }
};

// Hủy đăng ký token thiết bị
exports.unregisterDeviceToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token thiết bị là bắt buộc' });
    }

    const success = await deviceTokenModel.removeDeviceToken(userId, token);
    
    if (success) {
      res.json({ message: 'Hủy đăng ký token thiết bị thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy token thiết bị' });
    }
  } catch (error) {
    console.error('Lỗi hủy đăng ký token thiết bị:', error);
    res.status(500).json({ error: 'Lỗi server khi hủy đăng ký token thiết bị' });
  }
};

// Gửi thông báo đẩy đến người dùng cụ thể
exports.sendNotificationToUser = async (req, res) => {
  try {
    // Chỉ admin mới có quyền gửi thông báo
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền gửi thông báo' });
    }

    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'userId, title và body là bắt buộc' });
    }

    // Lấy tất cả token của người dùng
    const tokens = await deviceTokenModel.getUserDeviceTokens(userId);

    if (tokens.length === 0) {
      return res.status(404).json({ message: 'Người dùng không có thiết bị nào đăng ký' });
    }

    // Gửi thông báo đến tất cả thiết bị của người dùng
    const result = await firebaseService.sendMulticastPushNotification(tokens, title, body, data || {});
    
    res.json({
      message: 'Gửi thông báo thành công',
      successCount: result.successCount,
      failureCount: result.failureCount
    });
  } catch (error) {
    console.error('Lỗi gửi thông báo:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi thông báo' });
  }
};

// Gửi thông báo đến nhiều người dùng
exports.sendNotificationToMultipleUsers = async (req, res) => {
  try {
    // Chỉ admin mới có quyền gửi thông báo
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền gửi thông báo' });
    }

    const { userIds, title, body, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !title || !body) {
      return res.status(400).json({ error: 'userIds (array), title và body là bắt buộc' });
    }

    // Lấy tất cả token của các người dùng
    const tokens = await deviceTokenModel.getMultipleUsersDeviceTokens(userIds);

    if (tokens.length === 0) {
      return res.status(404).json({ message: 'Không có thiết bị nào được đăng ký cho các người dùng này' });
    }

    // Gửi thông báo đến tất cả thiết bị
    const result = await firebaseService.sendMulticastPushNotification(tokens, title, body, data || {});
    
    res.json({
      message: 'Gửi thông báo thành công',
      successCount: result.successCount,
      failureCount: result.failureCount
    });
  } catch (error) {
    console.error('Lỗi gửi thông báo đến nhiều người dùng:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi thông báo' });
  }
};

// Gửi thông báo theo chủ đề
exports.sendNotificationToTopic = async (req, res) => {
  try {
    // Chỉ admin mới có quyền gửi thông báo
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền gửi thông báo' });
    }

    const { topic, title, body, data } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({ error: 'topic, title và body là bắt buộc' });
    }

    // Gửi thông báo theo chủ đề
    const result = await firebaseService.sendTopicPushNotification(topic, title, body, data || {});
    
    res.json({
      message: 'Gửi thông báo theo chủ đề thành công',
      messageId: result
    });
  } catch (error) {
    console.error('Lỗi gửi thông báo theo chủ đề:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi thông báo' });
  }
};

// Tiện ích gửi thông báo đến người dùng (sử dụng nội bộ)
exports.sendNotificationToUserInternal = async (userId, title, body, data = {}) => {
  try {
    // Lấy tất cả token của người dùng
    const tokens = await deviceTokenModel.getUserDeviceTokens(userId);

    if (tokens.length === 0) {
      console.log(`Người dùng ${userId} không có thiết bị nào đăng ký`);
      return null;
    }

    // Gửi thông báo đến tất cả thiết bị của người dùng
    return await firebaseService.sendMulticastPushNotification(tokens, title, body, data);
  } catch (error) {
    console.error('Lỗi gửi thông báo nội bộ:', error);
    return null;
  }
};