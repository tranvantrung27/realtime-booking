let io;
const connectedUsers = new Map(); // Lưu trữ mapping giữa userId và socketId

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('🟢 Client connected:', socket.id);

      // Xử lý đăng nhập người dùng
      socket.on('user_connected', (userId) => {
        if (userId) {
          // Lưu mapping userId -> socketId
          connectedUsers.set(userId, socket.id);
          console.log(`👤 User ${userId} connected with socket ${socket.id}`);
          
          // Tham gia phòng theo userId
          socket.join(`user_${userId}`);
        }
      });

      // Bác sĩ tham gia phòng
      socket.on('join_doctor_room', (doctorId) => {
        if (doctorId) {
          socket.join(`doctor_${doctorId}`);
          console.log(`👨‍⚕️ Doctor joined room: doctor_${doctorId}`);
        }
      });

      // Bệnh nhân tham gia phòng
      socket.on('join_patient_room', (patientId) => {
        if (patientId) {
          socket.join(`patient_${patientId}`);
          console.log(`🧑 Patient joined room: patient_${patientId}`);
        }
      });

      // Xử lý ngắt kết nối
      socket.on('disconnect', () => {
        // Tìm và xóa người dùng khỏi map khi ngắt kết nối
        for (const [userId, socketId] of connectedUsers.entries()) {
          if (socketId === socket.id) {
            connectedUsers.delete(userId);
            console.log(`👤 User ${userId} disconnected`);
            break;
          }
        }
        console.log('🔴 Client disconnected:', socket.id);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },

  // Kiểm tra người dùng có online không
  isUserOnline: (userId) => {
    return connectedUsers.has(userId);
  },

  // Lấy socketId của người dùng
  getUserSocketId: (userId) => {
    return connectedUsers.get(userId);
  },

  // Gửi thông báo tới người dùng cụ thể
  sendToUser: (userId, event, data) => {
    if (io && userId) {
      io.to(`user_${userId}`).emit(event, data);
      return true;
    }
    return false;
  },

  // Gửi thông báo tới bác sĩ
  sendToDoctor: (doctorId, event, data) => {
    if (io && doctorId) {
      io.to(`doctor_${doctorId}`).emit(event, data);
      return true;
    }
    return false;
  },

  // Gửi thông báo tới bệnh nhân
  sendToPatient: (patientId, event, data) => {
    if (io && patientId) {
      io.to(`patient_${patientId}`).emit(event, data);
      return true;
    }
    return false;
  }
};