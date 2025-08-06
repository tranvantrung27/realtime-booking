const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// Đăng ký token thiết bị
router.post('/register-device', verifyToken, notificationController.registerDeviceToken);

// Hủy đăng ký token thiết bị
router.post('/unregister-device', verifyToken, notificationController.unregisterDeviceToken);

// Gửi thông báo đến người dùng cụ thể (chỉ admin)
router.post('/send-to-user', verifyToken, requireRole('admin'), notificationController.sendNotificationToUser);

// Gửi thông báo đến nhiều người dùng (chỉ admin)
router.post('/send-to-multiple-users', verifyToken, requireRole('admin'), notificationController.sendNotificationToMultipleUsers);

// Gửi thông báo theo chủ đề (chỉ admin)
router.post('/send-to-topic', verifyToken, requireRole('admin'), notificationController.sendNotificationToTopic);

module.exports = router;