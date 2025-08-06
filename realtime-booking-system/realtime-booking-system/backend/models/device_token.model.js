const db = require('../config/db');

// Lưu token thiết bị mới
const saveDeviceToken = async (userId, token, deviceInfo) => {
  try {
    // Kiểm tra token đã tồn tại chưa
    const [existingTokens] = await db.query(
      'SELECT * FROM device_tokens WHERE user_id = ? AND token = ?',
      [userId, token]
    );

    if (existingTokens.length > 0) {
      // Cập nhật thông tin thiết bị và thời gian cập nhật
      await db.query(
        'UPDATE device_tokens SET device_info = ?, updated_at = NOW() WHERE user_id = ? AND token = ?',
        [JSON.stringify(deviceInfo), userId, token]
      );
      return existingTokens[0].id;
    } else {
      // Thêm token mới
      const [result] = await db.query(
        'INSERT INTO device_tokens (user_id, token, device_info) VALUES (?, ?, ?)',
        [userId, token, JSON.stringify(deviceInfo)]
      );
      return result.insertId;
    }
  } catch (error) {
    console.error('Lỗi khi lưu token thiết bị:', error);
    throw error;
  }
};

// Xóa token thiết bị
const removeDeviceToken = async (userId, token) => {
  try {
    const [result] = await db.query(
      'DELETE FROM device_tokens WHERE user_id = ? AND token = ?',
      [userId, token]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Lỗi khi xóa token thiết bị:', error);
    throw error;
  }
};

// Lấy tất cả token của người dùng
const getUserDeviceTokens = async (userId) => {
  try {
    const [tokens] = await db.query(
      'SELECT token FROM device_tokens WHERE user_id = ?',
      [userId]
    );
    return tokens.map(t => t.token);
  } catch (error) {
    console.error('Lỗi khi lấy token thiết bị của người dùng:', error);
    throw error;
  }
};

// Lấy tất cả token của nhiều người dùng
const getMultipleUsersDeviceTokens = async (userIds) => {
  try {
    if (!userIds.length) return [];
    
    const placeholders = userIds.map(() => '?').join(',');
    const [tokens] = await db.query(
      `SELECT token FROM device_tokens WHERE user_id IN (${placeholders})`,
      userIds
    );
    return tokens.map(t => t.token);
  } catch (error) {
    console.error('Lỗi khi lấy token thiết bị của nhiều người dùng:', error);
    throw error;
  }
};

module.exports = {
  saveDeviceToken,
  removeDeviceToken,
  getUserDeviceTokens,
  getMultipleUsersDeviceTokens
};