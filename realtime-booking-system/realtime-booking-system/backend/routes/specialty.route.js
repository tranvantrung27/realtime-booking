const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialty.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// Public routes
router.get('/specialties', specialtyController.getAllSpecialties);
router.get('/specialties/:id', specialtyController.getSpecialtyById);
router.get('/specialties/:id/doctors', specialtyController.getDoctorsBySpecialty);

// Admin routes
router.post('/admin/specialties', verifyToken, requireRole('admin'), specialtyController.createSpecialty);
router.put('/admin/specialties/:id', verifyToken, requireRole('admin'), specialtyController.updateSpecialty);
router.delete('/admin/specialties/:id', verifyToken, requireRole('admin'), specialtyController.deleteSpecialty);

module.exports = router;