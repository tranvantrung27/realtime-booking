const db = require('../config/db');

// Get all specialties
exports.getAllSpecialties = async (req, res) => {
  try {
    const query = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM doctor_specialties ds WHERE ds.specialty_id = s.id) as doctor_count
      FROM specialties s
      ORDER BY s.name
    `;
    const [specialties] = await db.query(query);
    res.json(specialties);
  } catch (err) {
    console.error('Error fetching specialties:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách khoa' });
  }
};

// Get a single specialty by ID
exports.getSpecialtyById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM doctor_specialties ds WHERE ds.specialty_id = s.id) as doctor_count
      FROM specialties s
      WHERE s.id = ?
    `;
    const [specialties] = await db.query(query, [id]);
    const specialty = specialties[0];
    
    if (!specialty) {
      return res.status(404).json({ error: 'Không tìm thấy khoa' });
    }
    
    res.json(specialty);
  } catch (err) {
    console.error('Error fetching specialty:', err);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin khoa' });
  }
};

// Create a new specialty
exports.createSpecialty = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Tên khoa là bắt buộc' });
    }
    
    // Check if specialty already exists
    const checkQuery = 'SELECT * FROM specialties WHERE name = ?';
    const [existingSpecialties] = await db.query(checkQuery, [name]);
    
    if (existingSpecialties.length > 0) {
      return res.status(400).json({ error: 'Khoa này đã tồn tại' });
    }
    
    // Insert new specialty
    const insertQuery = 'INSERT INTO specialties (name, description) VALUES (?, ?)';
    const [result] = await db.query(insertQuery, [name, description || '']);
    
    res.status(201).json({
      id: result.insertId,
      name,
      description: description || '',
      message: 'Thêm khoa thành công'
    });
  } catch (err) {
    console.error('Error creating specialty:', err);
    res.status(500).json({ error: 'Lỗi khi thêm khoa' });
  }
};

// Update a specialty
exports.updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Tên khoa là bắt buộc' });
    }
    
    // Check if specialty exists
    const checkQuery = 'SELECT * FROM specialties WHERE id = ?';
    const [existingSpecialty] = await db.query(checkQuery, [id]);
    
    if (existingSpecialty.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khoa' });
    }
    
    // Check if name already exists for another specialty
    const nameCheckQuery = 'SELECT * FROM specialties WHERE name = ? AND id != ?';
    const [existingName] = await db.query(nameCheckQuery, [name, id]);
    
    if (existingName.length > 0) {
      return res.status(400).json({ error: 'Tên khoa đã tồn tại' });
    }
    
    // Update specialty
    const updateQuery = 'UPDATE specialties SET name = ?, description = ? WHERE id = ?';
    await db.query(updateQuery, [name, description || '', id]);
    
    res.json({
      id: parseInt(id),
      name,
      description: description || '',
      message: 'Cập nhật khoa thành công'
    });
  } catch (err) {
    console.error('Error updating specialty:', err);
    res.status(500).json({ error: 'Lỗi khi cập nhật khoa' });
  }
};

// Delete a specialty
exports.deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if specialty exists
    const checkQuery = 'SELECT * FROM specialties WHERE id = ?';
    const [existingSpecialty] = await db.query(checkQuery, [id]);
    
    if (existingSpecialty.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khoa' });
    }
    
    // Check if specialty is being used by doctors
    const usageQuery = 'SELECT * FROM doctor_specialties WHERE specialty_id = ?';
    const [usageResult] = await db.query(usageQuery, [id]);
    
    if (usageResult.length > 0) {
      return res.status(400).json({ 
        error: 'Không thể xóa khoa này vì đang được sử dụng bởi bác sĩ',
        doctor_count: usageResult.length
      });
    }
    
    // Delete specialty
    const deleteQuery = 'DELETE FROM specialties WHERE id = ?';
    await db.query(deleteQuery, [id]);
    
    res.json({ message: 'Xóa khoa thành công' });
  } catch (err) {
    console.error('Error deleting specialty:', err);
    res.status(500).json({ error: 'Lỗi khi xóa khoa' });
  }
};

// Get doctors by specialty
exports.getDoctorsBySpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT u.id, u.full_name, u.email, u.phone, u.created_at
      FROM users u
      JOIN doctor_specialties ds ON u.id = ds.doctor_id
      WHERE ds.specialty_id = ? AND u.role = 'doctor'
      ORDER BY u.full_name
    `;
    
    const [doctors] = await db.query(query, [id]);
    
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching doctors by specialty:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bác sĩ theo khoa' });
  }
};