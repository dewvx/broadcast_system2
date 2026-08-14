const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT d.doc_id, d.doc_name, d.doc_file_path, d.upload_date, d.created_by, u.full_name AS created_by_name
     FROM tb_document d
     JOIN tb_user u ON d.created_by = u.user_id
     ORDER BY d.upload_date DESC`
  );
  return rows;
}

async function findById(docId) {
  const [rows] = await pool.query(
    `SELECT d.*, u.full_name AS created_by_name
     FROM tb_document d
     JOIN tb_user u ON d.created_by = u.user_id
     WHERE d.doc_id = ?`,
    [docId]
  );
  return rows[0] || null;
}

async function create({ docName, docFilePath, createdBy }) {
  const [result] = await pool.query(
    `INSERT INTO tb_document (doc_name, doc_file_path, created_by) VALUES (?, ?, ?)`,
    [docName, docFilePath, createdBy]
  );
  return result.insertId;
}

async function remove(docId) {
  await pool.query(`DELETE FROM tb_document WHERE doc_id = ?`, [docId]);
}

module.exports = { findAll, findById, create, remove };