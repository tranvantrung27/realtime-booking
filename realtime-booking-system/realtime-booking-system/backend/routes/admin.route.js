const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// Middleware để kiểm tra quyền admin
const requireAdmin = requireRole('admin');

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Quản lý appointments - SẮP XẾP THEO THỨ TỰ MỚI NHẤT
router.get('/appointments', adminController.getAllAppointments);
router.put('/appointments/:id/status', adminController.updateAppointmentStatus);
router.get('/appointments/:id/history', adminController.getAppointmentHistory);

// Quản lý bác sĩ - CRUD ĐẦY ĐỦ
router.get('/doctors', adminController.getAllDoctors);
router.post('/doctors', adminController.addDoctor); // THÊM BÁC SĨ MỚI
router.get('/doctors/:id', adminController.getDoctorDetails);
router.put('/doctors/:id', adminController.updateDoctor); // CẬP NHẬT BÁC SĨ
router.delete('/doctors/:id', adminController.deleteUser); // XÓA BÁC SĨ

// Quản lý bệnh nhân - CRUD ĐẦY ĐỦ
router.get('/patients', adminController.getAllPatients);
router.post('/patients', adminController.addPatient); // THÊM BỆNH NHÂN MỚI
router.get('/patients/:id', adminController.getPatientDetails);
router.put('/patients/:id', adminController.updatePatient); // CẬP NHẬT BỆNH NHÂN
router.delete('/patients/:id', adminController.deleteUser); // XÓA BỆNH NHÂN

// Xóa tài khoản (generic)
router.delete('/users/:id', adminController.deleteUser);

// Cập nhật khoa cho bác sĩ
router.put('/doctors/:doctorId/specialties', adminController.updateDoctorSpecialties);

// Lấy thông tin bác sĩ với khoa
router.get('/doctors/:id/with-specialties', adminController.getDoctorWithSpecialties);

module.exports = router; 