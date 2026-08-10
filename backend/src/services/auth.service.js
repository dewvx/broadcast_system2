const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

async function login(username, password) {
  const user = await userModel.findByUsername(username);

  if (!user) {
    const err = new Error('ไม่พบชื่อผู้ใช้นี้ในระบบ');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('รหัสผ่านไม่ถูกต้อง');
    err.statusCode = 401;
    throw err;
  }

  const payload = {
    userId: user.user_id,
    username: user.username,
    roleId: user.role_id,
    roleName: user.role_name,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  return {
    token,
    user: {
      userId: user.user_id,
      username: user.username,
      fullName: user.full_name,
      roleId: user.role_id,
      roleName: user.role_name,
    },
  };
}

async function hashPassword(plainPassword) {
  const SALT_ROUNDS = 10;
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

module.exports = { login, hashPassword };