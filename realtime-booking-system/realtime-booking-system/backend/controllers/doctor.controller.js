const db = require('../config/db');

exports.getAllDoctors = async (req, res) => {
  try {
    // Lấy tất cả users có role 'doctor'
    const [rows] = await db.query(`
      SELECT id, full_name, email, phone, profile_image
      FROM users 
      WHERE role = 'doctor'
    `);
    
    console.log('Doctors found:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error getting doctors:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Thêm endpoint lấy chi tiết bác sĩ
exports.getDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin bác sĩ
    const [doctors] = await db.query(`
      SELECT id, full_name, email, phone, created_at, profile_image
      FROM users 
      WHERE id = ? AND role = 'doctor'
    `, [id]);
    
    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bác sĩ' });
    }
    
    const doctor = doctors[0];
    
    // Lấy danh sách lịch hẹn của bác sĩ
    const [appointments] = await db.query(`
      SELECT 
        a.id,
        a.appointment_time,
        a.status,
        a.note,
        p.full_name as patient_name,
        p.email as patient_email
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_time DESC
      LIMIT 10
    `, [id]);
    
    // Lấy khoa của bác sĩ
    const [specialties] = await db.query(`
      SELECT s.id, s.name, s.description
      FROM specialties s
      JOIN doctor_specialties ds ON s.id = ds.specialty_id
      WHERE ds.doctor_id = ?
      ORDER BY s.name
    `, [id]);
    
    res.json({
      doctor,
      appointments,
      specialties
    });
  } catch (err) {
    console.error('Error getting doctor details:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
