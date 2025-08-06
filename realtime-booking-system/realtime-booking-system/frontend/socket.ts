import { io } from "socket.io-client";

// Tạo instance socket nhưng chưa kết nối ngay
export const socket = io("http://localhost:3000", {
  autoConnect: false, // Không tự động kết nối
  reconnection: true, // Cho phép kết nối lại
  reconnectionAttempts: 5, // Số lần thử kết nối lại
  reconnectionDelay: 1000, // Thời gian giữa các lần thử kết nối (ms)
  timeout: 10000 // Thời gian timeout (ms)
});

// Thêm các listener cho sự kiện kết nối
socket.on("connect", () => {
  console.log("🟢 Socket.io đã kết nối thành công, ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Lỗi kết nối Socket.io:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Socket.io đã ngắt kết nối:", reason);
});