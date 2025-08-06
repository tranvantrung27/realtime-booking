const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Hàm mã hóa mật khẩu sử dụng SHA-256
const hashPasswordSHA = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

exports.register = async (req, res) => {
  const { full_name, email, password, role, phone } = req.body;

  // Validate input
  if (!full_name || !email || !password || !role || !phone) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
  }

  try {
    // Kiểm tra email đã tồn tại chưa
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // Mã hóa mật khẩu sử dụng SHA-256
    const hashedPassword = hashPasswordSHA(password);
    
    // Mã hóa mật khẩu sử dụng bcrypt cho bảo mật cao hơn (nếu cần)
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm người dùng mới vào database
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, role, phone]
    );

    // Tạo token JWT
    const token = jwt.sign(
      { id: result.insertId, role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: result.insertId,
        full_name,
        role
      }
    });
  } catch (err) {
    console.error('[ERROR] Lỗi khi đăng ký:', err.message || err);
    res.status(500).json({ error: 'Lỗi server khi đăng ký' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      console.log('[DEBUG] Email không tồn tại:', email);
      return res.status(401).json({ error: 'Sai email hoặc mật khẩu!' });
    }

    // Kiểm tra mật khẩu sử dụng SHA-256
    const hashedInputPassword = hashPasswordSHA(password);
    if (hashedInputPassword !== user.password) {
      // Thử với bcrypt nếu SHA không khớp (để tương thích với người dùng cũ)
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('[DEBUG] Mật khẩu sai. Nhập:', password, '| Mã hóa DB:', user.password);
        return res.status(401).json({ error: 'Sai email hoặc mật khẩu!' });
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    console.log('[DEBUG] Đăng nhập thành công:', email);

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('[ERROR] Lỗi khi đăng nhập:', err.message || err);
    res.status(500).json({ error: 'Lỗi server khi đăng nhập' });
  }
};
