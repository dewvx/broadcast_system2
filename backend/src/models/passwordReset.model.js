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
 * ค้นหาคำขอรีเซ็ตที่ยังใช้ได้ล่าสุดของ username (ยังไม่หมดอายุ + ยังไม่เคยใช้)
 * flow ใหม่ไม่ส่ง reset_token ให้ client — ระบุตัวตนด้วย username + OTP แทน
 * (createReset ยกเลิกตัวเก่าเสมอ จึงมี active ได้แค่ 1 record ต่อ user)
 */
async function findActiveByUsername(username) {
  const [rows] = await pool.query(
    `SELECT pr.*, u.username, u.full_name, u.line_user_id
     FROM tb_password_reset pr
     JOIN tb_user u ON pr.user_id = u.user_id
     WHERE u.username = ?
       AND pr.is_used = 0
       AND pr.expires_at > NOW()
     ORDER BY pr.reset_id DESC
     LIMIT 1`,
    [String(username).trim()]
  );
  return rows[0] || null;
}

/**
 * เช็คว่า user เพิ่งขอ OTP ไปไม่นาน (cooldown กันสแปมขอ OTP รัว)
 * เทียบเวลาฝั่ง SQL ทั้งคู่ (created_at vs NOW()) จึงไม่พึ่ง timezone ของเครื่อง
 */
async function hasRecentReset(userId, withinSeconds) {
  const [rows] = await pool.query(
    `SELECT reset_id FROM tb_password_reset
     WHERE user_id = ? AND created_at > NOW() - INTERVAL ? SECOND
     LIMIT 1`,
    [userId, withinSeconds]
  );
  return rows.length > 0;
}

/**
 * นับจำนวนครั้งที่กรอก OTP ผิด (atomic) — ครบ maxAttempts ครั้ง invalid token ทันที
 * @returns {number} จำนวนครั้งสะสมล่าสุด
 */
async function registerFailedAttempt(resetId, maxAttempts) {
  // หมายเหตุ: MySQL ประมวลผล SET ซ้ายไปขวา — assignment ของ is_used เห็น
  // attempts_count ค่าใหม่ (บวกแล้ว) จึงเช็ค >= maxAttempts โดยไม่บวกซ้ำ
  const [result] = await pool.query(
    `UPDATE tb_password_reset
     SET attempts_count = attempts_count + 1,
         is_used = IF(attempts_count >= ?, 1, is_used)
     WHERE reset_id = ? AND is_used = 0`,
    [maxAttempts, resetId]
  );
  return result.affectedRows;
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
  findActiveByUsername,
  hasRecentReset,
  registerFailedAttempt,
  markAsUsed,
};
