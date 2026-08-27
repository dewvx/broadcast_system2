const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT n.news_id, n.news_title, n.news_content, n.category_id, c.category_name,
            n.news_image, n.news_status, n.created_by, u.full_name AS created_by_name,
            n.approved_by, n.created_at,
            (SELECT COUNT(*) FROM tb_view_log WHERE news_id = n.news_id) AS view_count
     FROM tb_news n
     LEFT JOIN tb_category c ON n.category_id = c.category_id
     LEFT JOIN tb_user u ON n.created_by = u.user_id
     WHERE n.is_deleted = 0
     ORDER BY n.created_at DESC`
  );
  return rows;
}

async function findById(newsId) {
  const [rows] = await pool.query(
    `SELECT n.*, c.category_name, u.full_name AS created_by_name,
            (SELECT COUNT(*) FROM tb_view_log WHERE news_id = n.news_id) AS view_count
     FROM tb_news n
     LEFT JOIN tb_category c ON n.category_id = c.category_id
     LEFT JOIN tb_user u ON n.created_by = u.user_id
     WHERE n.news_id = ? AND n.is_deleted = 0`,
    [newsId]
  );
  return rows[0] || null;
}

async function create({ newsTitle, newsContent, categoryId, newsImage, createdBy }) {
  const [result] = await pool.query(
    `INSERT INTO tb_news (news_title, news_content, category_id, news_image, news_status, created_by, is_deleted)
     VALUES (?, ?, ?, ?, 'Pending', ?, 0)`,
    [newsTitle, newsContent, categoryId, newsImage || null, createdBy]
  );
  return result.insertId;
}

async function update(newsId, { newsTitle, newsContent, categoryId, newsImage }) {
  await pool.query(
    `UPDATE tb_news
     SET news_title = ?, news_content = ?, category_id = ?, news_image = ?
     WHERE news_id = ? AND is_deleted = 0`,
    [newsTitle, newsContent, categoryId, newsImage || null, newsId]
  );
}

async function remove(newsId) {
  await pool.query(`UPDATE tb_news SET is_deleted = 1 WHERE news_id = ?`, [newsId]);
}

async function updateStatus(newsId, status, approvedBy) {
  await pool.query(
    `UPDATE tb_news SET news_status = ?, approved_by = ? WHERE news_id = ?`,
    [status, approvedBy, newsId]
  );
}

async function setImage(newsId, imagePath) {
  await pool.query(`UPDATE tb_news SET news_image = ? WHERE news_id = ?`, [imagePath, newsId]);
}

module.exports = { findAll, findById, create, update, remove, updateStatus, setImage };