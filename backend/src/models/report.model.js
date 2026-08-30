const pool = require('../config/db');

/**
 * นับจำนวนข่าวแยกตามสถานะ -> { Pending: 3, Approved: 5, Rejected: 1 }
 */
async function countNewsByStatus() {
  const [rows] = await pool.query(
    `SELECT news_status, COUNT(*) AS total FROM tb_news GROUP BY news_status`
  );

  // เติมสถานะที่ไม่มีข้อมูลเลยให้เป็น 0 (กัน frontend ต้องมาเช็ค undefined เอง)
  const result = { Pending: 0, Approved: 0, Rejected: 0 };
  rows.forEach((row) => {
    result[row.news_status] = row.total;
  });
  return result;
}

async function countTotalVillagers() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM tb_villager WHERE is_deleted = 0`);
  return rows[0].total;
}

async function countTotalBroadcasts() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM tb_broadcast_log`);
  return rows[0].total;
}

async function sumTotalViews() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM tb_view_log`);
  return rows[0].total;
}

/**
 * ข่าวที่มีคนเปิดดูเยอะที่สุด เรียงจากมากไปน้อย
 */
async function getTopViewedNews(limit) {
  const [rows] = await pool.query(
    `SELECT n.news_id, n.news_title, n.news_status, COUNT(v.view_id) AS view_count
     FROM tb_news n
     LEFT JOIN tb_view_log v ON n.news_id = v.news_id
     GROUP BY n.news_id
     ORDER BY view_count DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

/**
 * ประวัติการส่งข่าวล่าสุด (ย้อนหลัง)
 */
async function getRecentBroadcasts(limit) {
  const [rows] = await pool.query(
    `SELECT bl.log_id, bl.news_id, n.news_title, bl.sent_by, u.full_name AS sent_by_name,
            bl.total_received, bl.sent_at
     FROM tb_broadcast_log bl
     JOIN tb_news n ON bl.news_id = n.news_id
     JOIN tb_user u ON bl.sent_by = u.user_id
     ORDER BY bl.sent_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

module.exports = {
  countNewsByStatus,
  countTotalVillagers,
  countTotalBroadcasts,
  sumTotalViews,
  getTopViewedNews,
  getRecentBroadcasts,
};