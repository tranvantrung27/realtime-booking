const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running 🚀' });
});

// Routes
const doctorRoutes = require('./routes/doctor.route');
app.use('/api/doctors', doctorRoutes);

const specialtyRoutes = require('./routes/specialty.route');
app.use('/api', specialtyRoutes);

const appointmentRoutes = require('./routes/appointment.route');
app.use('/api/appointments', appointmentRoutes);

const authRoutes = require('./routes/auth.route');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./routes/admin.route');
app.use('/api/admin', adminRoutes);

// Thêm route cho thông báo đẩy
const notificationRoutes = require('./routes/notification.route');
app.use('/api/notifications', notificationRoutes);

// Thêm route cho Gemini AI
const geminiRoutes = require('./routes/gemini.route');
app.use('/api/gemini', geminiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Lỗi server không xác định',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Đã xảy ra lỗi'
  });
});

module.exports = app;