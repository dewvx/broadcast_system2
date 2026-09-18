const pool = require('../config/db');

/**
 * นับจำนวนข่าวแยกตามสถานะ -> { Pending: 3, Approved: 5, Rejected: 1 }
 */
async function countNewsByStatus() {
  const [rows] = await pool.query(
    `SELECT news_status, COUNT(*) AS total FROM tb_news WHERE is_deleted = 0 GROUP BY news_status`
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
     WHERE n.is_deleted = 0
     GROUP BY n.news_id
     ORDER BY view_count DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

/**
 * ประวัติการส่งข่าวล่าสุด (ย้อนหลัง) พร้อมระบบแบ่งหน้าและค้นหา
 */
async function getBroadcastLogs({ page = 1, limit = 10, search = '' } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 10);
  const offset = (safePage - 1) * safeLimit;

  let whereClause = '';
  const countParams = [];
  const dataParams = [];

  if (search && search.trim()) {
    whereClause = 'WHERE (n.news_title LIKE ? OR u.full_name LIKE ?)';
    const term = `%${search.trim()}%`;
    countParams.push(term, term);
    dataParams.push(term, term);
  }

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM tb_broadcast_log bl
     JOIN tb_news n ON bl.news_id = n.news_id
     JOIN tb_user u ON bl.sent_by = u.user_id
     ${whereClause}`,
    countParams
  );
  const total = countRows[0].total;

  dataParams.push(safeLimit, offset);
  const [rows] = await pool.query(
    `SELECT bl.log_id, bl.news_id, n.news_title, n.news_image, c.category_name,
            bl.sent_by, u.full_name AS sent_by_name, u.username AS sent_by_username,
            bl.total_received, bl.sent_at
     FROM tb_broadcast_log bl
     JOIN tb_news n ON bl.news_id = n.news_id
     JOIN tb_user u ON bl.sent_by = u.user_id
     LEFT JOIN tb_category c ON n.category_id = c.category_id
     ${whereClause}
     ORDER BY bl.sent_at DESC
     LIMIT ? OFFSET ?`,
    dataParams
  );

  return {
    rows,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}

async function getRecentBroadcasts(limit) {
  const res = await getBroadcastLogs({ page: 1, limit });
  return res.rows;
}

module.exports = {
  countNewsByStatus,
  countTotalVillagers,
  countTotalBroadcasts,
  sumTotalViews,
  getTopViewedNews,
  getRecentBroadcasts,
  getBroadcastLogs,
};