const db = require('../config/db');
const socketService = require('../sockets/socket');

// ✅ Đặt lịch
exports.createAppointment = async (req, res) => {
  try {
    const { doctor_id, appointment_time, note } = req.body;
    const patientId = req.user.id;

    // Kiểm tra trùng lịch
    const [exist] = await db.query(
      'SELECT * FROM appointments WHERE doctor_id = ? AND appointment_time = ?',
      [doctor_id, appointment_time]
    );
    if (exist.length > 0) {
      return res.status(400).json({ error: 'Bác sĩ đã có lịch tại thời điểm này!' });
    }

    // Tạo lịch hẹn mới
    const [result] = await db.query(
      'INSERT INTO appointments (doctor_id, appointment_time, note, patient_id, status) VALUES (?, ?, ?, ?, ?)',
      [doctor_id, appointment_time, note, patientId, 'pending']
    );

    // Lấy thông tin bác sĩ và bệnh nhân
    const [[doctor]] = await db.query('SELECT email, full_name FROM users WHERE id = ?', [doctor_id]);
    const [[patient]] = await db.query('SELECT full_name, email FROM users WHERE id = ?', [patientId]);

    // Chuẩn bị dữ liệu thông báo
    const appointmentData = {
      id: result.insertId,
      doctor_id,
      appointment_time,
      note,
      status: 'pending',
      patient_id: patientId,
      patient_name: patient.full_name,
      doctor_name: doctor.full_name
    };

    // Gửi email thông báo (hiện đang tắt)
    /*
    const { sendMail } = require('../utils/mailer');
    await sendMail(
      doctor.email,
      '🔔 Có lịch khám mới',
      `<p>Bạn có lịch hẹn mới với bệnh nhân <strong>${patient.full_name}</strong> vào lúc <strong>${appointment_time}</strong>.</p><p>Ghi chú: ${note || 'Không có'}</p>`
    );
    */

    // Gửi thông báo qua socket
    socketService.sendToDoctor(doctor_id, 'new_appointment', appointmentData);
    socketService.sendToPatient(patientId, 'appointment_created', appointmentData);

    res.status(201).json({ message: 'Đặt lịch thành công', appointment: appointmentData });
  } catch (err) {
    console.error('Lỗi khi đặt lịch:', err.message || err);
    res.status(500).json({ error: 'Lỗi server khi đặt lịch' });
  }
};

// ✅ Lấy lịch người dùng
exports.getUserAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const sort = req.query.sort || 'desc'; // Mặc định sắp xếp giảm dần (mới nhất lên đầu)
    
    // Xây dựng câu truy vấn với phân trang và lọc theo trạng thái
    let query = `
      SELECT a.id, a.appointment_time, a.status, a.note, a.created_at, 
             u.full_name AS doctor_name, u.id AS doctor_id
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      WHERE a.patient_id = ?
    `;
    
    const queryParams = [patientId];
    
    // Thêm điều kiện lọc theo trạng thái nếu có
    if (status) {
      query += ' AND a.status = ?';
      queryParams.push(status);
    }
    
    // Thêm sắp xếp và phân trang
    const sortOrder = sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY a.appointment_time ${sortOrder} LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // Thực hiện truy vấn
    const [rows] = await db.query(query, queryParams);
    
    // Đếm tổng số lịch hẹn để tính tổng số trang
    let countQuery = `
      SELECT COUNT(*) as total FROM appointments 
      WHERE patient_id = ?
    `;
    const countParams = [patientId];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const [[countResult]] = await db.query(countQuery, countParams);
    const totalItems = countResult.total;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      appointments: rows,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages
      }
    });
  } catch (err) {
    console.error('Lỗi lấy lịch hẹn:', err.message || err);
    res.status(500).json({ error: 'Server lỗi' });
  }
};

// ✅ Lấy tất cả lịch (admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const doctorId = req.query.doctor_id || '';
    const sort = req.query.sort || 'desc'; // Mặc định sắp xếp giảm dần (mới nhất lên đầu)
    
    // Xây dựng câu truy vấn với phân trang và lọc
    let query = `
      SELECT a.id, a.appointment_time, a.status, a.note, a.created_at,
             d.full_name AS doctor_name, d.id AS doctor_id,
             p.full_name AS patient_name, p.id AS patient_id
      FROM appointments a
      JOIN users d ON a.doctor_id = d.id
      JOIN users p ON a.patient_id = p.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Thêm điều kiện lọc
    if (status) {
      query += ' AND a.status = ?';
      queryParams.push(status);
    }
    
    if (doctorId) {
      query += ' AND a.doctor_id = ?';
      queryParams.push(doctorId);
    }
    
    // Thêm sắp xếp và phân trang
    const sortOrder = sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY a.appointment_time ${sortOrder} LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // Thực hiện truy vấn
    const [rows] = await db.query(query, queryParams);
    
    // Đếm tổng số lịch hẹn để tính tổng số trang
    let countQuery = 'SELECT COUNT(*) as total FROM appointments WHERE 1=1';
    const countParams = [];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (doctorId) {
      countQuery += ' AND doctor_id = ?';
      countParams.push(doctorId);
    }
    
    const [[countResult]] = await db.query(countQuery, countParams);
    const totalItems = countResult.total;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      appointments: rows,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages
      }
    });
  } catch (err) {
    console.error('Lỗi lấy tất cả lịch:', err.message || err);
    res.status(500).json({ error: 'Lỗi server khi lấy lịch' });
  }
};

// ✅ Bác sĩ xem lịch của mình
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const sort = req.query.sort || 'desc'; // Mặc định sắp xếp giảm dần (mới nhất lên đầu)
    
    // Xây dựng câu truy vấn với phân trang và lọc
    let query = `
      SELECT a.id, a.appointment_time, a.status, a.note, a.created_at,
             p.full_name AS patient_name, p.id AS patient_id
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
    `;
    
    const queryParams = [doctorId];
    
    if (status) {
      query += ' AND a.status = ?';
      queryParams.push(status);
    }
    
    // Thêm sắp xếp và phân trang
    const sortOrder = sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY a.appointment_time ${sortOrder} LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // Thực hiện truy vấn
    const [rows] = await db.query(query, queryParams);
    
    // Đếm tổng số lịch hẹn để tính tổng số trang
    let countQuery = 'SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ?';
    const countParams = [doctorId];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const [[countResult]] = await db.query(countQuery, countParams);
    const totalItems = countResult.total;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      appointments: rows,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages
      }
    });
  } catch (err) {
    console.error('Lỗi lấy lịch bác sĩ:', err.message || err);
    res.status(500).json({ error: 'Lỗi server khi lấy lịch của bác sĩ' });
  }
};

// ✅ Bác sĩ cập nhật trạng thái lịch
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointmentId = req.params.id;
    const { status } = req.body;

    // Kiểm tra xem lịch có đúng của bác sĩ không
    const [check] = await db.query(
      'SELECT * FROM appointments WHERE id = ? AND doctor_id = ?',
      [appointmentId, doctorId]
    );

    if (check.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật lịch này' });
    }

    const appointment = check[0]; // lấy thông tin lịch khám
    const { patient_id, appointment_time, note } = appointment;

    // Cập nhật trạng thái
    await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, appointmentId]);

    // Lấy thêm thông tin bệnh nhân và bác sĩ
    const [[patient]] = await db.query('SELECT email, full_name FROM users WHERE id = ?', [patient_id]);
    const [[doctor]] = await db.query('SELECT full_name FROM users WHERE id = ?', [doctorId]);

    // Chuẩn bị dữ liệu thông báo
    const updateData = {
      appointment_id: appointmentId,
      new_status: status,
      doctor_id: doctorId,
      doctor_name: doctor.full_name,
      patient_id: patient_id,
      patient_name: patient.full_name,
      appointment_time: appointment_time
    };

    // Gửi thông báo qua socket
    socketService.sendToPatient(patient_id, 'appointment_updated', updateData);
    
    // ✅ Gửi email cho bệnh nhân - tạm thời comment out
    /*
    const { sendMail } = require('../utils/mailer');
    let statusText = '';
    if (status === 'confirmed') {
      statusText = 'được <strong>xác nhận</strong>';
    } else if (status === 'cancelled') {
      statusText = 'bị <strong>từ chối</strong>';
    } else if (status === 'done') {
      statusText = 'đã <strong>hoàn thành</strong>';
    } else {
      statusText = 'được <strong>cập nhật</strong>';
    }

    await sendMail(
      patient.email,
      '📢 Cập nhật lịch khám',
      `<p>Lịch khám của bạn vào lúc <strong>${new Date(appointment_time).toLocaleString('vi-VN')}</strong> ${statusText}.</p>`
    );
    */

    res.json({ message: 'Cập nhật trạng thái thành công', appointment: updateData });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err.message || err);
    res.status(500).json({ error: 'Server lỗi khi cập nhật trạng thái' });
  }
};

// Lấy lịch sử khám bệnh chi tiết của bệnh nhân
exports.getPatientHistory = async (req, res) => {
  try {
    const patientId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const sort = req.query.sort || 'desc'; // Mặc định sắp xếp giảm dần (mới nhất lên đầu)
    
    // Kiểm tra quyền truy cập (chỉ admin hoặc bác sĩ hoặc chính bệnh nhân đó)
    if (req.user.role !== 'admin' && req.user.role !== 'doctor' && req.user.id != patientId) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    // Xây dựng câu truy vấn với phân trang và lọc
    let query = `
      SELECT a.id, a.appointment_time, a.status, a.note, a.created_at,
              d.full_name AS doctor_name, d.id AS doctor_id,
              s.name AS specialty_name
      FROM appointments a
      JOIN users d ON a.doctor_id = d.id
      LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
      LEFT JOIN specialties s ON ds.specialty_id = s.id
      WHERE a.patient_id = ?
    `;
    
    const queryParams = [patientId];
    
    // Thêm điều kiện lọc theo trạng thái nếu có
    if (status) {
      query += ' AND a.status = ?';
      queryParams.push(status);
    }
    
    // Thêm sắp xếp và phân trang
    const sortOrder = sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY a.appointment_time ${sortOrder} LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // Thực hiện truy vấn
    const [appointments] = await db.query(query, queryParams);
    
    // Đếm tổng số lịch sử
    let countQuery = 'SELECT COUNT(*) as total FROM appointments WHERE patient_id = ?';
    const countParams = [patientId];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const [[countResult]] = await db.query(countQuery, countParams);
    
    // Lấy thông tin bệnh nhân
    const [[patient]] = await db.query(
      'SELECT full_name, email, phone FROM users WHERE id = ?',
      [patientId]
    );
    
    res.json({
      patient,
      appointments,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (err) {
    console.error('Lỗi lấy lịch sử khám bệnh:', err.message || err);
    res.status(500).json({ error: 'Lỗi server khi lấy lịch sử khám bệnh' });
  }
};