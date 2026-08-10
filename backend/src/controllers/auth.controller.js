const authService = require('../services/auth.service');
const userModel = require('../models/user.model');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอก username และ password' });
    }

    const result = await authService.login(username, password);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    // req.user มาจาก auth.middleware.js (decode JWT แล้ว)
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งาน' });
    }

    // map เป็น camelCase ให้ตรงกับ response format ของ /login
    res.json({
      success: true,
      user: {
        userId: user.user_id,
        username: user.username,
        fullName: user.full_name,
        roleId: user.role_id,
        roleName: user.role_name,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me };