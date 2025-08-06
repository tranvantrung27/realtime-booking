const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { verifyToken } = require('../middlewares/auth.middleware'); // ✅ THÊM

router.get('/', verifyToken, doctorController.getAllDoctors); // ✅ THÊM MIDDLEWARE
router.get('/:id', verifyToken, doctorController.getDoctorDetails); // ✅ Thêm route chi tiết bác sĩ

module.exports = router;
