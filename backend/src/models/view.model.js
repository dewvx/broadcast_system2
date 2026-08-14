const pool = require('../config/db');

/**
 * บันทึกว่าลูกบ้านคนนี้เข้าดูข่าวนี้แล้ว
 * ไม่เช็คว่าซ้ำหรือไม่ - ปล่อยให้บันทึกทุกครั้งที่เปิดดู (นับเป็น "จำนวนการเข้าชม" ไม่ใช่ "จำนวนคนที่เคยดู")
 * ถ้าอนาคตอยากนับแบบ unique viewer ต่อข่าว ค่อยเปลี่ยน query ตรงนี้เป็นเช็คก่อน insert
 */
async function createViewLog(newsId, villagerId) {
  await pool.query(
    `INSERT INTO tb_view_log (news_id, villager_id) VALUES (?, ?)`,
    [newsId, villagerId]
  );
}

/**
 * นับจำนวนการเข้าชมทั้งหมดของข่าวนี้ (ใช้ตอนทำ Report/Dashboard ทีหลัง)
 */
async function countViewsByNewsId(newsId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM tb_view_log WHERE news_id = ?`,
    [newsId]
  );
  return rows[0].total;
}

module.exports = { createViewLog, countViewsByNewsId };