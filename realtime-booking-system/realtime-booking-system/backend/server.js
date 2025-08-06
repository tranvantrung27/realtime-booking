require('dotenv').config({ path: './config/.env' }); // ✅ load đúng vị trí
console.log('[DEBUG] Loaded mail user:', process.env.MAIL_USER);


const http = require('http');
const app = require('./app');
const server = http.createServer(app);

// 🟢 KHỞI TẠO socket CHỈ MỘT LẦN
const io = require('./sockets/socket').init(server);

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
