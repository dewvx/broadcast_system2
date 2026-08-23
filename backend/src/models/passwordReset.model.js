const pool = require('../config/db');

/**
 * สร้างบันทึก OTP สำหรับรีเซ็ตรหัสผ่าน
 */
async function createReset({ userId, otp, resetToken, expiresAt }) {
  // ยกเลิก OTP เก่าที่ยังไม่ได้ใช้ของ user คนนี้ก่อน
  await pool.query(
    `UPDATE tb_password_reset SET is_used = 1 WHERE user_id = ? AND is_used = 0`,
    [userId]
  );

  const [result] = await pool.query(
    `INSERT INTO tb_password_reset (user_id, reset_otp, reset_token, expires_at, is_used)
     VALUES (?, ?, ?, ?, 0)`,
    [userId, otp, resetToken, expiresAt]
  );
  return result.insertId;
}

/**
 * ค้นหาคำขอรีเซ็ตที่ถูกต้อง (ตรง token + OTP + ยังไม่หมดอายุ + ยังไม่เคยใช้)
 */
async function findValidReset({ resetToken, otp }) {
  const [rows] = await pool.query(
    `SELECT pr.*, u.username, u.full_name, u.line_user_id
     FROM tb_password_reset pr
     JOIN tb_user u ON pr.user_id = u.user_id
     WHERE pr.reset_token = ?
       AND pr.reset_otp = ?
       AND pr.is_used = 0
       AND pr.expires_at > NOW()`,
    [resetToken, otp]
  );
  return rows[0] || null;
}

/**
 * ทำเครื่องหมายว่าใช้งาน OTP นี้แล้ว
 */
async function markAsUsed(resetId) {
  await pool.query(
    `UPDATE tb_password_reset SET is_used = 1 WHERE reset_id = ?`,
    [resetId]
  );
}

module.exports = {
  createReset,
  findValidReset,
  markAsUsed,
};
