const db = require('../config/db');
const bcrypt = require('bcrypt');

// Lấy tất cả appointments cho admin - SẮP XẾP THEO THỨ TỰ MỚI NHẤT
exports.getAllAppointments = async (req, res) => {
  try {
    // Kiểm tra cấu trúc bảng appointments
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'appointments'
    `);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('Available columns:', columnNames);
    
    // Xây dựng query dựa trên cấu trúc bảng thực tế
    let query = `
      SELECT 
        a.id,
        a.appointment_time,
        a.status,
        a.created_at,
        d.full_name as doctor_name,
        p.full_name as patient_name
    `;
    
    // Thêm các cột nếu tồn tại
    if (columnNames.includes('appointment_date')) {
      query = query.replace('a.appointment_time,', 'a.appointment_date, a.appointment_time,');
    }
    
    if (columnNames.includes('notes')) {
      query = query.replace('a.status,', 'a.status, a.notes,');
    } else if (columnNames.includes('note')) {
      query = query.replace('a.status,', 'a.status, a.note as notes,');
    }
    
    if (columnNames.includes('phone')) {
      query = query.replace('p.full_name as patient_name', 'p.full_name as patient_name, p.phone as patient_phone');
    }
    
    query += `
      FROM appointments a
      LEFT JOIN users d ON a.doctor_id = d.id
      LEFT JOIN users p ON a.patient_id = p.id
      ORDER BY a.created_at DESC
    `;
    
    if (columnNames.includes('appointment_date')) {
      query = query.replace('ORDER BY a.created_at DESC', 'ORDER BY a.created_at DESC, a.appointment_date DESC, a.appointment_time DESC');
    }
    
    console.log('Executing query:', query);
    
    const [rows] = await db.query(query);
    
    console.log('Appointments found:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error getting appointments:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage
    });
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
};

// Lấy tất cả bác sĩ
exports.getAllDoctors = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id, 
        full_name, 
        email, 
        phone,
        created_at,
        profile_image,
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = users.id) as appointment_count
      FROM users 
      WHERE role = 'doctor'
      ORDER BY created_at DESC
    `);
    
    console.log('Doctors found:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error getting doctors:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Lấy tất cả bệnh nhân
exports.getAllPatients = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id, 
        full_name, 
        email, 
        phone,
        created_at,
        profile_image,
        (SELECT COUNT(*) FROM appointments WHERE patient_id = users.id) as appointment_count
      FROM users 
      WHERE role = 'patient'
      ORDER BY created_at DESC
    `);
    
    console.log('Patients found:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error getting patients:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Lấy thống kê tổng quan
exports.getDashboardStats = async (req, res) => {
  try {
    // Thống kê tổng quan
    const [doctorCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "doctor"');
    const [patientCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "patient"');
    const [appointmentCount] = await db.query('SELECT COUNT(*) as count FROM appointments');
    const [confirmedAppointments] = await db.query('SELECT COUNT(*) as count FROM appointments WHERE status = "confirmed"');
    const [pendingAppointments] = await db.query('SELECT COUNT(*) as count FROM appointments WHERE status = "pending"');
    const [cancelledAppointments] = await db.query('SELECT COUNT(*) as count FROM appointments WHERE status = "cancelled"');
    const [completedAppointments] = await db.query('SELECT COUNT(*) as count FROM appointments WHERE status = "completed"');

    res.json({
      doctors: doctorCount[0].count,
      patients: patientCount[0].count,
      totalAppointments: appointmentCount[0].count,
      confirmedAppointments: confirmedAppointments[0].count,
      pendingAppointments: pendingAppointments[0].count,
      cancelledAppointments: cancelledAppointments[0].count,
      completedAppointments: completedAppointments[0].count
    });
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Lấy chi tiết bác sĩ
exports.getDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [doctorRows] = await db.query(`
      SELECT 
        id, 
        full_name, 
        email, 
        phone,
        created_at
      FROM users 
      WHERE id = ? AND role = 'doctor'
    `, [id]);

    if (doctorRows.length === 0) {
      return res.status(404).json({ error: 'Bác sĩ không tồn tại' });
    }

    const doctor = doctorRows[0];

    // Lấy lịch hẹn của bác sĩ
    const [appointments] = await db.query(`
      SELECT 
        a.id,
        a.appointment_time,
        a.status,
        p.full_name as patient_name
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
      ORDER BY a.created_at DESC
    `, [id]);

    res.json({
      doctor,
      appointments
    });
  } catch (err) {
    console.error('Error getting doctor details:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Lấy chi tiết bệnh nhân
exports.getPatientDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [patientRows] = await db.query(`
      SELECT 
        id, 
        full_name, 
        email, 
        phone,
        created_at
      FROM users 
      WHERE id = ? AND role = 'patient'
    `, [id]);

    if (patientRows.length === 0) {
      return res.status(404).json({ error: 'Bệnh nhân không tồn tại' });
    }

    const patient = patientRows[0];

    // Lấy lịch hẹn của bệnh nhân
    const [appointments] = await db.query(`
      SELECT 
        a.id,
        a.appointment_time,
        a.status,
        d.full_name as doctor_name
      FROM appointments a
      JOIN users d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.created_at DESC
    `, [id]);

    res.json({
      patient,
      appointments
    });
  } catch (err) {
    console.error('Error getting patient details:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 

// THÊM BÁC SĨ MỚI
exports.addDoctor = async (req, res) => {
  try {
    const { full_name, email, phone, password, specialtyIds } = req.body;
    
    // Kiểm tra email đã tồn tại chưa
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    
    // Thêm bác sĩ mới
    const [result] = await db.query(`
      INSERT INTO users (full_name, email, password, phone, role) 
      VALUES (?, ?, ?, ?, 'doctor')
    `, [full_name, email, hashedPassword, phone]);
    
    const doctorId = result.insertId;
    
    // Gán khoa chuyên môn nếu có
    if (specialtyIds && specialtyIds.length > 0) {
      const values = specialtyIds.map(specialtyId => [doctorId, specialtyId]);
      await db.query(`
        INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES ?
      `, [values]);
    }
    
    res.status(201).json({ 
      message: 'Thêm bác sĩ thành công',
      doctorId: doctorId
    });
  } catch (err) {
    console.error('Error adding doctor:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// CẬP NHẬT THÔNG TIN BÁC SĨ
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, specialtyIds } = req.body;
    
    // Kiểm tra bác sĩ có tồn tại không
    const [doctorRows] = await db.query(`
      SELECT id, full_name FROM users WHERE id = ? AND role = 'doctor'
    `, [id]);
    
    if (doctorRows.length === 0) {
      return res.status(404).json({ error: 'Bác sĩ không tồn tại' });
    }
    
    // Kiểm tra email đã tồn tại chưa (trừ bác sĩ hiện tại)
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    
    // Cập nhật thông tin bác sĩ
    await db.query(`
      UPDATE users 
      SET full_name = ?, email = ?, phone = ?
      WHERE id = ? AND role = 'doctor'
    `, [full_name, email, phone, id]);
    
    // Cập nhật khoa chuyên môn nếu có
    if (specialtyIds !== undefined) {
      // Xóa khoa hiện tại
      await db.query('DELETE FROM doctor_specialties WHERE doctor_id = ?', [id]);
      
      // Thêm khoa mới
      if (specialtyIds && specialtyIds.length > 0) {
        const values = specialtyIds.map(specialtyId => [id, specialtyId]);
        await db.query(`
          INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES ?
        `, [values]);
      }
    }
    
    res.json({ message: 'Cập nhật bác sĩ thành công' });
  } catch (err) {
    console.error('Error updating doctor:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// THÊM BỆNH NHÂN MỚI
exports.addPatient = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    
    // Kiểm tra email đã tồn tại chưa
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    
    // Thêm bệnh nhân mới
    const [result] = await db.query(`
      INSERT INTO users (full_name, email, password, phone, role) 
      VALUES (?, ?, ?, ?, 'patient')
    `, [full_name, email, hashedPassword, phone]);
    
    res.status(201).json({ 
      message: 'Thêm bệnh nhân thành công',
      patientId: result.insertId
    });
  } catch (err) {
    console.error('Error adding patient:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// CẬP NHẬT THÔNG TIN BỆNH NHÂN
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, password } = req.body;
    
    // Kiểm tra bệnh nhân có tồn tại không
    const [patientRows] = await db.query(`
      SELECT id, full_name FROM users WHERE id = ? AND role = 'patient'
    `, [id]);
    
    if (patientRows.length === 0) {
      return res.status(404).json({ error: 'Bệnh nhân không tồn tại' });
    }
    
    // Kiểm tra email đã tồn tại chưa (trừ bệnh nhân hiện tại)
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    
    // Xây dựng câu lệnh SQL và tham số
    let sql = `UPDATE users SET full_name = ?, email = ?, phone = ?`;
    let params = [full_name, email, phone];
    
    // Nếu có mật khẩu mới, cập nhật mật khẩu
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql += `, password = ?`;
      params.push(hashedPassword);
    }
    
    // Thêm điều kiện WHERE
    sql += ` WHERE id = ? AND role = 'patient'`;
    params.push(id);
    
    // Thực hiện cập nhật
    await db.query(sql, params);
    
    res.json({ message: 'Cập nhật bệnh nhân thành công' });
  } catch (err) {
    console.error('Error updating patient:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Xóa tài khoản (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra xem user có tồn tại không
    const [userRows] = await db.query(`
      SELECT id, full_name, role FROM users WHERE id = ?
    `, [id]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    
    const user = userRows[0];
    
    // Không cho phép xóa admin khác
    if (user.role === 'admin' && user.id !== req.user.id) {
      return res.status(403).json({ error: 'Không thể xóa tài khoản admin khác' });
    }
    
    // Kiểm tra xem có lịch hẹn active không
    const [activeAppointments] = await db.query(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE (patient_id = ? OR doctor_id = ?) AND status IN ('pending', 'confirmed')
    `, [id, id]);
    
    if (activeAppointments[0].count > 0) {
      return res.status(400).json({ 
        error: 'Không thể xóa người dùng có lịch hẹn đang hoạt động' 
      });
    }
    
    // Xóa user (cascade sẽ xóa appointments và doctor_specialties)
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: `Đã xóa ${user.role === 'doctor' ? 'bác sĩ' : 'bệnh nhân'} ${user.full_name} thành công` });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cập nhật thông tin bác sĩ với khoa
exports.updateDoctorSpecialties = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { specialtyIds } = req.body; // Array of specialty IDs
    
    // Kiểm tra bác sĩ có tồn tại không
    const [doctorRows] = await db.query(`
      SELECT id, full_name FROM users WHERE id = ? AND role = 'doctor'
    `, [doctorId]);
    
    if (doctorRows.length === 0) {
      return res.status(404).json({ error: 'Bác sĩ không tồn tại' });
    }
    
    // Xóa tất cả khoa hiện tại
    await db.query('DELETE FROM doctor_specialties WHERE doctor_id = ?', [doctorId]);
    
    // Thêm khoa mới
    if (specialtyIds && specialtyIds.length > 0) {
      const values = specialtyIds.map(specialtyId => [doctorId, specialtyId]);
      await db.query(`
        INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES ?
      `, [values]);
    }
    
    res.json({ message: 'Cập nhật khoa thành công' });
  } catch (err) {
    console.error('Error updating doctor specialties:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Lấy thông tin bác sĩ với khoa
exports.getDoctorWithSpecialties = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin bác sĩ
    const [doctorRows] = await db.query(`
      SELECT 
        u.id, 
        u.full_name, 
        u.email, 
        u.phone,
        u.created_at,
        u.profile_image
      FROM users u
      WHERE u.id = ? AND u.role = 'doctor'
    `, [id]);
    
    if (doctorRows.length === 0) {
      return res.status(404).json({ error: 'Bác sĩ không tồn tại' });
    }
    
    const doctor = doctorRows[0];
    
    // Lấy khoa của bác sĩ
    const [specialties] = await db.query(`
      SELECT s.id, s.name, s.description
      FROM specialties s
      JOIN doctor_specialties ds ON s.id = ds.specialty_id
      WHERE ds.doctor_id = ?
      ORDER BY s.name ASC
    `, [id]);
    
    // Lấy lịch hẹn của bác sĩ
    const [appointments] = await db.query(`
      SELECT 
        a.id,
        a.appointment_time,
        a.status,
        p.full_name as patient_name
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
      ORDER BY a.created_at DESC
    `, [id]);
    
    res.json({
      doctor,
      specialties,
      appointments
    });
  } catch (err) {
    console.error('Error getting doctor with specialties:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// CẬP NHẬT TRẠNG THÁI LỊCH HẸN
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Kiểm tra lịch hẹn có tồn tại không
    const [appointmentRows] = await db.query(`
      SELECT id, status FROM appointments WHERE id = ?
    `, [id]);
    
    if (appointmentRows.length === 0) {
      return res.status(404).json({ error: 'Lịch hẹn không tồn tại' });
    }
    
    // Cập nhật trạng thái lịch hẹn
    await db.query(`
      UPDATE appointments 
      SET status = ?, notes = ?
      WHERE id = ?
    `, [status, notes, id]);
    
    // Thêm vào lịch sử
    await db.query(`
      INSERT INTO appointment_history (appointment_id, status, notes)
      VALUES (?, ?, ?)
    `, [id, status, notes]);
    
    res.json({ message: 'Cập nhật trạng thái lịch hẹn thành công' });
  } catch (err) {
    console.error('Error updating appointment status:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// LẤY LỊCH SỬ LỊCH HẸN
exports.getAppointmentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [history] = await db.query(`
      SELECT 
        ah.status,
        ah.notes,
        ah.created_at
      FROM appointment_history ah
      WHERE ah.appointment_id = ?
      ORDER BY ah.created_at DESC
    `, [id]);
    
    res.json(history);
  } catch (err) {
    console.error('Error getting appointment history:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 