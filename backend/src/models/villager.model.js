const pool = require('../config/db');

/**
 * หาลูกบ้านจาก LINE User ID (ใช้เช็คว่าเคยลงทะเบียนหรือยัง)
 */
async function findByLineUserId(lineUserId) {
  const [rows] = await pool.query(
    `SELECT villager_id, line_user_id, display_name, first_name, last_name,
            house_number, zone_name, join_date
     FROM tb_villager
     WHERE line_user_id = ?`,
    [lineUserId]
  );
  return rows[0] || null;
}

async function findById(villagerId) {
  const [rows] = await pool.query(
    `SELECT villager_id, line_user_id, display_name, first_name, last_name,
            house_number, zone_name, join_date
     FROM tb_villager
     WHERE villager_id = ?`,
    [villagerId]
  );
  return rows[0] || null;
}

/**
 * สมัครลูกบ้านใหม่ (เรียกครั้งเดียวตอนแรกที่เข้า LIFF)
 */
async function create({ lineUserId, displayName, firstName, lastName, houseNumber, zoneName }) {
  const [result] = await pool.query(
    `INSERT INTO tb_villager (line_user_id, display_name, first_name, last_name, house_number, zone_name)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [lineUserId, displayName, firstName, lastName, houseNumber, zoneName || null]
  );
  return result.insertId;
}

module.exports = { findByLineUserId, findById, create };