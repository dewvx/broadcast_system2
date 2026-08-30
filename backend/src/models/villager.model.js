const pool = require('../config/db');

/**
 * หาลูกบ้านจาก LINE User ID (ใช้เช็คว่าเคยลงทะเบียนหรือยัง และยังไม่ถูกลบ)
 */
async function findByLineUserId(lineUserId) {
  const [rows] = await pool.query(
    `SELECT villager_id, line_user_id, display_name, first_name, last_name,
            house_number, zone_name, pdpa_consent_at, is_active, join_date
     FROM tb_villager
     WHERE line_user_id = ? AND is_deleted = 0`,
    [lineUserId]
  );
  return rows[0] || null;
}

async function findById(villagerId) {
  const [rows] = await pool.query(
    `SELECT villager_id, line_user_id, display_name, first_name, last_name,
            house_number, zone_name, pdpa_consent_at, is_active, join_date
     FROM tb_villager
     WHERE villager_id = ? AND is_deleted = 0`,
    [villagerId]
  );
  return rows[0] || null;
}

/**
 * สมัครลูกบ้านใหม่ (เรียกตอนลงทะเบียนผ่าน LIFF)
 * หากเคยมี record ที่ถูก soft-deleted ไว้ จะทำการ reactivate และอัปเดตข้อมูลใหม่
 */
async function create({ lineUserId, displayName, firstName, lastName, houseNumber, zoneName, pdpaConsentAt }) {
  const [existing] = await pool.query(
    `SELECT villager_id FROM tb_villager WHERE line_user_id = ? LIMIT 1`,
    [lineUserId]
  );

  if (existing && existing.length > 0) {
    const existingId = existing[0].villager_id;
    await pool.query(
      `UPDATE tb_villager 
       SET display_name = ?, first_name = ?, last_name = ?, house_number = ?, 
           zone_name = ?, pdpa_consent_at = ?, is_active = 1, is_deleted = 0, join_date = NOW()
       WHERE villager_id = ?`,
      [displayName, firstName, lastName, houseNumber, zoneName || null, pdpaConsentAt || null, existingId]
    );
    return existingId;
  }

  const [result] = await pool.query(
    `INSERT INTO tb_villager (line_user_id, display_name, first_name, last_name, house_number, zone_name, pdpa_consent_at, is_active, is_deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)`,
    [lineUserId, displayName, firstName, lastName, houseNumber, zoneName || null, pdpaConsentAt || null]
  );
  return result.insertId;
}

/**
 * ดึงรายชื่อลูกบ้านทั้งหมดที่ยังไม่ถูกลบ (Admin เท่านั้น)
 */
async function findAll() {
  const [rows] = await pool.query(
    `SELECT villager_id, line_user_id, display_name, first_name, last_name,
            house_number, zone_name, pdpa_consent_at, is_active, join_date
     FROM tb_villager
     WHERE is_deleted = 0
     ORDER BY join_date DESC`
  );
  return rows;
}

/**
 * ลูกบ้านแก้ไขโปรไฟล์ตนเองผ่าน LIFF (ค้นหาด้วย line_user_id)
 */
async function updateByLineUserId(lineUserId, { firstName, lastName, houseNumber, zoneName }) {
  await pool.query(
    `UPDATE tb_villager
     SET first_name = ?, last_name = ?, house_number = ?, zone_name = ?, is_active = 1
     WHERE line_user_id = ? AND is_deleted = 0`,
    [firstName, lastName, houseNumber, zoneName || null, lineUserId]
  );
}

/**
 * Admin แก้ไขข้อมูลลูกบ้านแทนให้ (ค้นหาด้วย villager_id)
 */
async function updateByAdmin(villagerId, { firstName, lastName, houseNumber, zoneName, isActive }) {
  await pool.query(
    `UPDATE tb_villager
     SET first_name = ?, last_name = ?, house_number = ?, zone_name = ?, is_active = ?
     WHERE villager_id = ? AND is_deleted = 0`,
    [firstName, lastName, houseNumber, zoneName || null, isActive !== undefined ? isActive : 1, villagerId]
  );
}

/**
 * อัปเดตสถานะการติดตาม (is_active) เมื่อลูกบ้าน unfollow หรือ re-follow LINE OA
 */
async function setIsActiveByLineUserId(lineUserId, isActive) {
  await pool.query(
    `UPDATE tb_villager SET is_active = ? WHERE line_user_id = ? AND is_deleted = 0`,
    [isActive ? 1 : 0, lineUserId]
  );
}

/**
 * ลบข้อมูลลูกบ้านออกจากระบบ (Soft Delete เพื่อรักษาสถิติ tb_view_log)
 */
async function remove(villagerId) {
  await pool.query(`UPDATE tb_villager SET is_deleted = 1 WHERE villager_id = ?`, [villagerId]);
}

module.exports = {
  findByLineUserId,
  findById,
  create,
  findAll,
  updateByLineUserId,
  updateByAdmin,
  setIsActiveByLineUserId,
  remove,
};