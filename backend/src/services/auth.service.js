const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userModel = require('../models/user.model');
const passwordResetModel = require('../models/passwordReset.model');
const { lineClient } = require('../config/line');

function throwError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

async function login(username, password) {
  const user = await userModel.findByUsername(username);

  if (!user) {
    throwError('ไม่พบชื่อผู้ใช้นี้ในระบบ', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throwError('รหัสผ่านไม่ถูกต้อง', 401);
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
      lineUserId: user.line_user_id,
      roleId: user.role_id,
      roleName: user.role_name,
    },
  };
}

async function hashPassword(plainPassword) {
  const SALT_ROUNDS = 10;
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * ขอ OTP รีเซ็ตรหัสผ่านผ่าน LINE OA
 */
async function requestPasswordReset(username) {
  if (!username || !username.trim()) {
    throwError('กรุณากรอกชื่อผู้ใช้งาน (Username)', 400);
  }

  const user = await userModel.findByUsername(username.trim());
  if (!user) {
    throwError('ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้งานอีกครั้ง', 404);
  }

  if (!user.line_user_id || !user.line_user_id.trim()) {
    throwError(
      'บัญชีนี้ยังไม่ได้ผูกกับ LINE Official Account จึงไม่สามารถรับรหัส OTP ได้ กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน',
      400
    );
  }

  // สร้าง OTP 6 หลักสุ่ม และ Secure Token
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 นาที

  await passwordResetModel.createReset({
    userId: user.user_id,
    otp,
    resetToken,
    expiresAt,
  });

  // ส่งรหัส OTP เข้า LINE ของ Admin/Leader ผ่าน Messaging API
  try {
    await lineClient.pushMessage({
      to: user.line_user_id.trim(),
      messages: [
        {
          type: 'text',
          text: `🔐 [ระบบหอกระจายข่าวชุมชน]\nรหัส OTP สำหรับรีเซ็ตรหัสผ่านของบัญชี "${user.username}" คือ:\n\n👉 ${otp} 👈\n\n(รหัสมีอายุการใช้งาน 10 นาที)\nหากท่านไม่ได้ทำรายการ โปรดละเว้นข้อความนี้`,
        },
      ],
    });
  } catch (err) {
    console.error('Failed to send LINE OTP push message:', err);
    throwError('ไม่สามารถส่งข้อความ OTP ไปยัง LINE ได้ กรุณาตรวจสอบว่าท่านได้เพิ่มเพื่อน LINE OA หรือยัง', 500);
  }

  return {
    resetToken,
    message: `ส่งรหัส OTP 6 หลักไปยัง LINE Official Account ของท่านเรียบร้อยแล้ว`,
  };
}

/**
 * ยืนยัน OTP และตั้งรหัสผ่านใหม่
 */
async function resetPassword({ resetToken, otp, newPassword }) {
  if (!resetToken || !otp || !otp.trim()) {
    throwError('กรุณากรอกรหัส OTP 6 หลักให้ครบถ้วน', 400);
  }

  if (!newPassword || newPassword.trim().length < 6) {
    throwError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 400);
  }

  const resetRecord = await passwordResetModel.findValidReset({
    resetToken,
    otp: otp.trim(),
  });

  if (!resetRecord) {
    throwError('รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว กรุณากดขอรหัสใหม่อีกครั้ง', 400);
  }

  const hashedPassword = await hashPassword(newPassword.trim());
  await userModel.updatePassword(resetRecord.user_id, hashedPassword);
  await passwordResetModel.markAsUsed(resetRecord.reset_id);

  // ส่งข้อความแจ้งเตือนความปลอดภัยเข้า LINE
  if (resetRecord.line_user_id) {
    try {
      await lineClient.pushMessage({
        to: resetRecord.line_user_id.trim(),
        messages: [
          {
            type: 'text',
            text: `✅ [ระบบหอกระจายข่าวชุมชน]\nรหัสผ่านสำหรับบัญชี "${resetRecord.username}" ได้รับการเปลี่ยนเรียบร้อยแล้ว\n\nหากท่านไม่ได้เป็นผู้ทำรายการ โปรดติดต่อผู้ดูแลระบบทันที`,
          },
        ],
      });
    } catch (err) {
      console.warn('Failed to send password reset confirmation message:', err);
    }
  }

  return {
    message: 'เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว ท่านสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที',
  };
}

module.exports = {
  login,
  hashPassword,
  requestPasswordReset,
  resetPassword,
};