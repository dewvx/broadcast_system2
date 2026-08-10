const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization; // รูปแบบ: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'ไม่พบ token กรุณา login ก่อน' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, username, roleId, roleName }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

module.exports = authMiddleware;