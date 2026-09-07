const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT c.category_id, c.category_name, c.created_at,
            COUNT(CASE WHEN n.is_deleted = 0 THEN n.news_id END) AS news_count
     FROM tb_category c
     LEFT JOIN tb_news n ON c.category_id = n.category_id
     GROUP BY c.category_id, c.category_name, c.created_at
     ORDER BY c.category_id ASC`
  );
  return rows;
}

async function findById(categoryId) {
  const [rows] = await pool.query(
    `SELECT category_id, category_name, created_at FROM tb_category WHERE category_id = ?`,
    [categoryId]
  );
  return rows[0] || null;
}

async function create(categoryName) {
  const [result] = await pool.query(
    `INSERT INTO tb_category (category_name) VALUES (?)`,
    [categoryName]
  );
  return result.insertId;
}

async function update(categoryId, categoryName) {
  await pool.query(
    `UPDATE tb_category SET category_name = ? WHERE category_id = ?`,
    [categoryName, categoryId]
  );
}

async function remove(categoryId) {
  await pool.query(`DELETE FROM tb_category WHERE category_id = ?`, [categoryId]);
}

// เช็คว่าหมวดหมู่นี้มีข่าวผูกอยู่มั้ย ก่อนจะลบ (กัน FK constraint error)
async function countNewsUsingCategory(categoryId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM tb_news WHERE category_id = ?`,
    [categoryId]
  );
  return rows[0].total;
}

module.exports = { findAll, findById, create, update, remove, countNewsUsingCategory };