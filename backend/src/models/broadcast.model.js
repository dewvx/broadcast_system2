const pool = require('../config/db');

/**
 * ดึง line_user_id ของลูกบ้าน
 * ถ้าไม่ส่ง zoneName มา (undefined/empty) -> ดึงทุกคน
 * ถ้าส่ง zoneName มา -> ดึงเฉพาะคนในโซนนั้น (เปรียบเทียบแบบยืดหยุ่น)
 */
async function getVillagerLineIds(zoneName) {
  if (!zoneName || !zoneName.trim()) {
    const [rows] = await pool.query(
      `SELECT line_user_id FROM tb_villager 
       WHERE line_user_id IS NOT NULL AND line_user_id != '' AND is_active = 1`
    );
    return rows.map((row) => row.line_user_id);
  }

  const cleanZone = zoneName.trim();
  const [rows] = await pool.query(
    `SELECT line_user_id FROM tb_villager 
     WHERE line_user_id IS NOT NULL AND line_user_id != '' AND is_active = 1
       AND (TRIM(zone_name) = ? OR zone_name LIKE ?)`,
    [cleanZone, `%${cleanZone}%`]
  );
  return rows.map((row) => row.line_user_id);
}

/**
 * ดึงรายชื่อโซนทั้งหมดที่มีลูกบ้านอยู่จริง (ไม่เอาค่า NULL หรือ ค่าว่าง)
 */
async function getAllZones() {
  const [rows] = await pool.query(
    `SELECT DISTINCT zone_name 
     FROM tb_villager 
     WHERE zone_name IS NOT NULL AND TRIM(zone_name) != '' 
     ORDER BY zone_name`
  );
  return rows.map((row) => row.zone_name);
}

async function createLog({ newsId, sentBy, totalReceived }) {
  const [result] = await pool.query(
    `INSERT INTO tb_broadcast_log (news_id, sent_by, total_received) VALUES (?, ?, ?)`,
    [newsId, sentBy, totalReceived]
  );
  return result.insertId;
}

async function findLogsByNewsId(newsId) {
  const [rows] = await pool.query(
    `SELECT bl.log_id, bl.news_id, bl.sent_by, u.full_name AS sent_by_name,
            bl.total_received, bl.sent_at
     FROM tb_broadcast_log bl
     JOIN tb_user u ON bl.sent_by = u.user_id
     WHERE bl.news_id = ?
     ORDER BY bl.sent_at DESC`,
    [newsId]
  );
  return rows;
}

module.exports = { getVillagerLineIds, getAllZones, createLog, findLogsByNewsId };