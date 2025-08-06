const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointment.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// ✅ Route cho admin xem tất cả lịch hẹn
router.get('/all', verifyToken, requireRole('admin'), appointmentController.getAllAppointments);

// ✅ Route cho người dùng đặt lịch
router.post('/', verifyToken, appointmentController.createAppointment);

// ✅ Route cho người dùng xem lịch đã đặt
router.get('/', verifyToken, appointmentController.getUserAppointments);

// ✅ Route cho bác sĩ xem lịch của họ
router.get('/doctor', verifyToken, requireRole('doctor'), appointmentController.getDoctorAppointments);

// ✅ Route cho bác sĩ cập nhật trạng thái
router.patch('/:id', verifyToken, requireRole('doctor'), appointmentController.updateAppointmentStatus);

// ✅ Route lấy lịch sử khám bệnh của bệnh nhân
router.get('/history/:id', verifyToken, appointmentController.getPatientHistory);

module.exports = router;