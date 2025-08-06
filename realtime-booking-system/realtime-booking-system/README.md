# 🏥 Hệ thống Đặt lịch Khám bệnh Thời gian thực

Hệ thống đặt lịch khám bệnh hiện đại với AI chatbot tích hợp Gemini AI, real-time notifications và giao diện responsive.

## ✨ Tính năng chính

- 🔐 **Authentication & Authorization** - JWT, Role-based access
- 📅 **Đặt lịch khám bệnh** - Real-time booking system
- 🤖 **AI Chatbot** - Tư vấn chuyên khoa với Gemini AI
- 🔔 **Real-time Notifications** - Socket.io integration
- 📱 **Responsive UI** - Tailwind CSS, modern design
- 📊 **Admin Dashboard** - Quản lý bác sĩ, bệnh nhân, chuyên khoa
- 📈 **Lịch sử khám bệnh** - Theo dõi tiền sử bệnh nhân

## 🛠 Công nghệ sử dụng

### Backend
- **Node.js + Express.js** - API server
- **Socket.io** - Real-time communication
- **MySQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email notifications

### Frontend
- **React 19 + TypeScript** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Socket.io-client** - Real-time updates
- **Axios** - HTTP requests
- **React Toastify** - Notifications

### AI Integration
- **Google Gemini AI** - Chatbot tư vấn y tế
- **Fallback System** - Mock responses khi API lỗi

## 🚀 Cài đặt nhanh

### 1. Clone dự án
```bash
git clone <repository-url>
cd realtime-booking-system
```

### 2. Cài đặt dependencies
```bash
npm run install:all
```

### 3. Cấu hình Gemini AI
```bash
# Tạo file .env trong thư mục frontend/
cp frontend/.env.example frontend/.env
# Chỉnh sửa REACT_APP_GEMINI_API_KEY trong file .env
```

### 4. Khởi chạy ứng dụng
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

## 🤖 Cấu hình Gemini AI

### 1. Lấy API Key
1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tạo API key mới
3. Copy API key

### 2. Cấu hình Environment
Tạo file `frontend/.env`:
```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
REACT_APP_API_URL=http://localhost:3000
```

### 3. Test API
```bash
npm run test:api
```

## 📋 Vai trò người dùng

### 👤 Bệnh nhân (Patient)
- Đặt lịch khám bệnh
- Xem lịch sử khám
- Chat với AI tư vấn
- Nhận thông báo real-time

### 👨‍⚕️ Bác sĩ (Doctor)
- Xem lịch hẹn
- Cập nhật trạng thái lịch
- Quản lý bệnh nhân
- Nhận thông báo mới

### 👨‍💼 Admin
- Quản lý bác sĩ
- Quản lý chuyên khoa
- Xem thống kê
- Quản lý toàn bộ hệ thống

## 🧪 Test API

### Test Gemini API
```bash
npm run test:api
```

### Test trong ứng dụng
1. Mở `http://localhost:5173`
2. Đăng nhập: `demo@hospital.com` / `demo123`
3. Click chat widget (góc dưới phải)
4. Gửi tin nhắn test

## 📁 Cấu trúc dự án

```
realtime-booking-system/
├── backend/                 # API Server
│   ├── controllers/        # Business logic
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── middlewares/       # Auth & validation
│   ├── sockets/           # Real-time communication
│   └── config/            # Database config
├── frontend/              # React App
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static files
├── test-gemini-api.js     # API test script
└── GEMINI_API_SETUP.md    # Detailed setup guide
```

## 🔧 Environment Variables

### Backend (.env trong backend/)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=realtime_booking
JWT_SECRET=your_jwt_secret
MAIL_USER=your_email
MAIL_PASS=your_email_password
```

### Frontend (.env trong frontend/)
```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_API_URL=http://localhost:3000
```

## 🚨 Troubleshooting

### Lỗi thường gặp

1. **API Key không hợp lệ**
   - Kiểm tra API key trong `.env`
   - Đảm bảo có quyền truy cập Gemini

2. **Database connection error**
   - Kiểm tra MySQL service
   - Cập nhật thông tin DB trong `.env`

3. **Socket connection failed**
   - Kiểm tra backend đã chạy chưa
   - Port 3000 có bị block không

4. **CORS error**
   - Kiểm tra proxy config trong vite.config.ts
   - Backend CORS settings

## 📞 Hỗ trợ

- **Documentation**: Xem `GEMINI_API_SETUP.md` để cài đặt chi tiết
- **Issues**: Tạo issue trên GitHub
- **Email**: Liên hệ qua email

## 📄 License

ISC License

---

**Lưu ý**: Đây là dự án demo. Trong môi trường production, hãy:
- Thay đổi tất cả default passwords
- Sử dụng HTTPS
- Cấu hình proper CORS
- Backup database thường xuyên
- Monitor API usage limits