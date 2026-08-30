const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

async function getAllUsers() {
  return userModel.findAll();
}

async function getAllRoles() {
  return userModel.findAllRoles();
}

async function getPublicContacts() {
  return userModel.findPublicContacts();
}

async function createUser(data) {
  const { username, password, fullName, phoneNumber, positionTitle, roleId, lineUserId } = data;

  if (!username || !password || !fullName || !roleId) {
    throwError('กรุณากรอกข้อมูลให้ครบถ้วน (username, password, full_name, role_id)', 400);
  }

  const existingUser = await userModel.findByUsername(username.trim());
  if (existingUser) {
    throwError('ชื่อผู้ใช้งานนี้ (username) มีในระบบแล้ว กรุณาใช้ชื่ออื่น', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await userModel.create({
    username: username.trim(),
    hashedPassword,
    fullName: fullName.trim(),
    phoneNumber: phoneNumber ? phoneNumber.trim() : null,
    positionTitle: positionTitle ? positionTitle.trim() : null,
    roleId,
    lineUserId: lineUserId ? lineUserId.trim() : null,
  });

  return userModel.findById(userId);
}

async function updateUser(userId, data, currentUser) {
  const user = await userModel.findById(userId);
  if (!user) throwError('ไม่พบผู้ใช้นี้ในระบบ', 404);

  // เช็คสิทธิ์: Admin แก้ไขได้ทุกคน หรือ ผู้ใช้ทั่วไปแก้ไขข้อมูลตนเองได้เท่านั้น
  if (currentUser.roleName !== 'Admin' && currentUser.userId !== Number(userId)) {
    throwError('คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้งานคนอื่น', 403);
  }

  const fullName = data.fullName ? data.fullName.trim() : user.full_name;
  const phoneNumber = data.phoneNumber !== undefined ? (data.phoneNumber ? data.phoneNumber.trim() : null) : user.phone_number;
  const positionTitle = data.positionTitle !== undefined ? (data.positionTitle ? data.positionTitle.trim() : null) : user.position_title;
  const roleId = currentUser.roleName === 'Admin' && data.roleId ? data.roleId : user.role_id;
  const lineUserId = data.lineUserId !== undefined ? (data.lineUserId ? data.lineUserId.trim() : null) : user.line_user_id;

  let hashedPassword = null;
  if (data.password && data.password.trim()) {
    hashedPassword = await bcrypt.hash(data.password.trim(), 10);
  }

  await userModel.update(userId, { fullName, phoneNumber, positionTitle, roleId, hashedPassword, lineUserId });
  return userModel.findById(userId);
}

async function deleteUser(userId, currentUser) {
  if (currentUser.roleName !== 'Admin') {
    throwError('เฉพาะผู้ใหญ่บ้าน (Admin) เท่านั้นที่ลบผู้ใช้งานได้', 403);
  }

  if (currentUser.userId === Number(userId)) {
    throwError('ไม่สามารถลบบัญชีผู้ใช้งานของตนเองที่กำลังล็อกอินอยู่ได้', 400);
  }

  const user = await userModel.findById(userId);
  if (!user) throwError('ไม่พบผู้ใช้นี้ในระบบ', 404);

  await userModel.remove(userId);
}

module.exports = {
  getAllUsers,
  getAllRoles,
  getPublicContacts,
  createUser,
  updateUser,
  deleteUser,
};
