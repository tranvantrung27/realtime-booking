const admin = require('firebase-admin');
const path = require('path');

// Kiểm tra xem Firebase đã được khởi tạo chưa
let initialized = false;

const initializeFirebase = () => {
  if (initialized) return;

  try {
    // Trong môi trường thực tế, bạn sẽ sử dụng service account key từ Firebase console
    // Đây là cách thiết lập cho môi trường development
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      // Hoặc sử dụng service account key file
      // credential: admin.credential.cert(require(path.resolve(__dirname, '../config/firebase-service-account.json'))),
      projectId: process.env.FIREBASE_PROJECT_ID || 'realtime-booking-system'
    });
    
    initialized = true;
    console.log('🔥 Firebase Admin SDK đã được khởi tạo');
  } catch (error) {
    console.error('❌ Lỗi khởi tạo Firebase:', error);
  }
};

// Gửi thông báo đẩy đến thiết bị cụ thể
const sendPushNotification = async (token, title, body, data = {}) => {
  if (!initialized) {
    initializeFirebase();
  }

  try {
    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK' // Cho Flutter/Mobile apps
      },
      token
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Thông báo đẩy đã được gửi:', response);
    return response;
  } catch (error) {
    console.error('❌ Lỗi gửi thông báo đẩy:', error);
    throw error;
  }
};

// Gửi thông báo đến nhiều thiết bị
const sendMulticastPushNotification = async (tokens, title, body, data = {}) => {
  if (!initialized) {
    initializeFirebase();
  }

  if (!tokens || tokens.length === 0) {
    console.warn('⚠️ Không có token thiết bị nào để gửi thông báo');
    return null;
  }

  try {
    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`✅ Thông báo đẩy đã được gửi tới ${response.successCount}/${tokens.length} thiết bị`);
    return response;
  } catch (error) {
    console.error('❌ Lỗi gửi thông báo đẩy đa thiết bị:', error);
    throw error;
  }
};

// Gửi thông báo theo chủ đề
const sendTopicPushNotification = async (topic, title, body, data = {}) => {
  if (!initialized) {
    initializeFirebase();
  }

  try {
    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      topic
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Thông báo đẩy theo chủ đề đã được gửi:', response);
    return response;
  } catch (error) {
    console.error('❌ Lỗi gửi thông báo đẩy theo chủ đề:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  sendPushNotification,
  sendMulticastPushNotification,
  sendTopicPushNotification
};