const pool = require('../config/db');

/**
 * ยกเลิก OTP เก่าทั้งหมดของ line_user_id นี้ที่ยังไม่ได้ใช้
 */
async function invalidatePreviousOtps(lineUserId, connection = pool) {
  const [result] = await connection.query(
    `UPDATE tb_villager_otp SET is_used = 1 WHERE line_user_id = ? AND is_used = 0`,
    [lineUserId]
  );
  return result.affectedRows;
}

/**
 * สร้างบันทึก OTP สำหรับยืนยันการลงทะเบียนลูกบ้าน
 */
async function create({ lineUserId, otpCode, expiresAt }) {
  await invalidatePreviousOtps(lineUserId);

  const [result] = await pool.query(
    `INSERT INTO tb_villager_otp (line_user_id, otp_code, expires_at, is_used, attempts_count)
     VALUES (?, ?, ?, 0, 0)`,
    [lineUserId, otpCode, expiresAt]
  );
  return result.insertId;
}

/**
 * สร้าง OTP พร้อมตรวจสอบ Cooldown ภายใต้ Atomic Named Lock (ป้องกัน Race Condition จาก Concurrent Requests)
 */
async function createWithLock({ lineUserId, otpCode, expiresAt, cooldownSeconds = 60 }) {
  const conn = await pool.getConnection();
  const lockKey = `otp_villager_${lineUserId}`;
  try {
    const [lockRows] = await conn.query('SELECT GET_LOCK(?, 10) AS acquired', [lockKey]);
    if (!lockRows[0] || lockRows[0].acquired !== 1) {
      const err = new Error('ระบบกำลังดำเนินการ กรุณารอสักครู่');
      err.statusCode = 429;
      throw err;
    }

    // ตรวจสอบ cooldown ภายใต้ Lock
    const [recent] = await conn.query(
      `SELECT otp_id FROM tb_villager_otp
       WHERE line_user_id = ? AND created_at > NOW() - INTERVAL ? SECOND
       LIMIT 1`,
      [lineUserId, cooldownSeconds]
    );

    if (recent.length > 0) {
      const err = new Error('คุณเพิ่งขอรหัส OTP ไปเมื่อสักครู่ กรุณารอประมาณ 1 นาทีแล้วลองใหม่อีกครั้ง');
      err.statusCode = 429;
      throw err;
    }

    // ยกเลิก OTP เก่าที่ยังไม่ได้ใช้
    await invalidatePreviousOtps(lineUserId, conn);

    // บันทึก OTP ใหม่
    const [result] = await conn.query(
      `INSERT INTO tb_villager_otp (line_user_id, otp_code, expires_at, is_used, attempts_count)
       VALUES (?, ?, ?, 0, 0)`,
      [lineUserId, otpCode, expiresAt]
    );

    return result.insertId;
  } finally {
    try {
      await conn.query('SELECT RELEASE_LOCK(?)', [lockKey]);
    } catch (_) {}
    conn.release();
  }
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
  invalidatePreviousOtps,
  create,
  createWithLock,
  findActiveByLineUserId,
  hasRecentOtp,
  registerFailedAttempt,
  markAsUsed,
};
