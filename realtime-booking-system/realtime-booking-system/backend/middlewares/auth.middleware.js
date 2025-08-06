const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Chưa có token!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token không hợp lệ!' });
  }
};

// ✅ THÊM ĐÚNG EXPORT CHO requireRole
exports.requireRole = (role) => {
  return (req, res, next) => {
    console.log('[DEBUG] User role check:', {
      requiredRole: role,
      userRole: req.user.role,
      userId: req.user.id
    });
    
    if (req.user.role !== role) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền truy cập',
        requiredRole: role,
        userRole: req.user.role
      });
    }
    next();
  };
};
