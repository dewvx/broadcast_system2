const pool = require('../config/db');

/**
 * สร้างบันทึก OTP สำหรับยืนยันการลงทะเบียนลูกบ้าน
 */
async function create({ lineUserId, otpCode, expiresAt }) {
  // ยกเลิก OTP เก่าที่ยังไม่ได้ใช้ของ line_user_id นี้ก่อน
  await pool.query(
    `UPDATE tb_villager_otp SET is_used = 1 WHERE line_user_id = ? AND is_used = 0`,
    [lineUserId]
  );

  const [result] = await pool.query(
    `INSERT INTO tb_villager_otp (line_user_id, otp_code, expires_at, is_used, attempts_count)
     VALUES (?, ?, ?, 0, 0)`,
    [lineUserId, otpCode, expiresAt]
  );
  return result.insertId;
}

/**
 * ค้นหาคำขอ OTP ที่ยังใช้ได้ล่าสุดของ line_user_id (ยังไม่หมดอายุ + ยังไม่เคยใช้)
 */
async function findActiveByLineUserId(lineUserId) {
  const [rows] = await pool.query(
    `SELECT * FROM tb_villager_otp
     WHERE line_user_id = ?
       AND is_used = 0
       AND expires_at > NOW()
     ORDER BY otp_id DESC
     LIMIT 1`,
    [String(lineUserId).trim()]
  );
  return rows[0] || null;
}

/**
 * เช็คว่า line_user_id เพิ่งขอ OTP ไปไม่นาน (cooldown กันสแปมขอ OTP รัว)
 */
async function hasRecentOtp(lineUserId, withinSeconds) {
  const [rows] = await pool.query(
    `SELECT otp_id FROM tb_villager_otp
     WHERE line_user_id = ? AND created_at > NOW() - INTERVAL ? SECOND
     LIMIT 1`,
    [lineUserId, withinSeconds]
  );
  return rows.length > 0;
}

/**
 * นับจำนวนครั้งที่กรอก OTP ผิด (atomic) — ครบ maxAttempts ครั้ง invalid OTP ทันที
 * @returns {number} affectedRows
 */
async function registerFailedAttempt(otpId, maxAttempts = 5) {
  const [result] = await pool.query(
    `UPDATE tb_villager_otp
     SET attempts_count = attempts_count + 1,
         is_used = IF(attempts_count >= ?, 1, is_used)
     WHERE otp_id = ? AND is_used = 0`,
    [maxAttempts, otpId]
  );
  return result.affectedRows;
}

/**
 * ทำเครื่องหมายว่าใช้งาน OTP นี้แล้ว
 */
async function markAsUsed(otpId) {
  await pool.query(
    `UPDATE tb_villager_otp SET is_used = 1 WHERE otp_id = ?`,
    [otpId]
  );
}

module.exports = {
  create,
  findActiveByLineUserId,
  hasRecentOtp,
  registerFailedAttempt,
  markAsUsed,
};
