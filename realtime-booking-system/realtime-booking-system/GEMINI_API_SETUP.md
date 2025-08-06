# 🚀 Hướng dẫn cài đặt Gemini AI API

## 📋 Yêu cầu

1. **Google Cloud Account** với API key cho Gemini AI
2. **Node.js** và **npm** đã cài đặt
3. **Dự án đã được clone** và cài đặt dependencies

## 🔧 Cài đặt

### 1. Lấy API Key Gemini

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập bằng Google Account
3. Tạo API key mới
4. Copy API key

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `frontend/`:

```bash
# Gemini AI API Configuration
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# Backend API URL
REACT_APP_API_URL=http://localhost:3000
```

### 3. Cài đặt Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 4. Khởi chạy ứng dụng

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🧪 Kiểm tra API

### Test API trực tiếp:

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Xin chào, bạn có thể giúp tôi đặt lịch khám bệnh không?"
      }]
    }]
  }'
```

### Test trong ứng dụng:

1. Mở ứng dụng tại `http://localhost:5173`
2. Đăng nhập với tài khoản demo
3. Click vào chat widget (góc dưới bên phải)
4. Gửi tin nhắn test

## 🔍 Troubleshooting

### Lỗi thường gặp:

1. **API Key không hợp lệ**
   - Kiểm tra API key trong `.env`
   - Đảm bảo API key có quyền truy cập Gemini

2. **CORS Error**
   - API được gọi trực tiếp từ frontend
   - Không cần proxy vì đã có fallback

3. **Network Error**
   - Kiểm tra kết nối internet
   - API sẽ fallback về mock response

4. **Rate Limit**
   - Gemini có giới hạn request
   - Sử dụng fallback nếu vượt quá limit

## 📝 Cấu trúc API Response

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Phản hồi từ AI..."
          }
        ]
      }
    }
  ]
}
```

## 🎯 Tính năng AI

- **Tư vấn chuyên khoa** dựa trên triệu chứng
- **Hướng dẫn đặt lịch**
- **Thông tin bệnh viện**
- **Fallback system** khi API lỗi

## 🔒 Bảo mật

- API key được lưu trong environment variables
- Không commit API key vào git
- Có timeout 10 giây cho mỗi request
- Fallback system đảm bảo ứng dụng luôn hoạt động

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console logs trong browser
2. Network tab trong DevTools
3. Terminal logs của backend