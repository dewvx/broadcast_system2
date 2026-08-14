const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT a.act_id, a.act_title, a.act_date, a.act_location, a.created_by, u.full_name AS created_by_name
     FROM tb_activity a
     JOIN tb_user u ON a.created_by = u.user_id
     ORDER BY a.act_date ASC`
  );
  return rows;
}

async function findById(actId) {
  const [rows] = await pool.query(
    `SELECT a.*, u.full_name AS created_by_name
     FROM tb_activity a
     JOIN tb_user u ON a.created_by = u.user_id
     WHERE a.act_id = ?`,
    [actId]
  );
  return rows[0] || null;
}

async function create({ actTitle, actDate, actLocation, createdBy }) {
  const [result] = await pool.query(
    `INSERT INTO tb_activity (act_title, act_date, act_location, created_by) VALUES (?, ?, ?, ?)`,
    [actTitle, actDate, actLocation, createdBy]
  );
  return result.insertId;
}

async function update(actId, { actTitle, actDate, actLocation }) {
  await pool.query(
    `UPDATE tb_activity SET act_title = ?, act_date = ?, act_location = ? WHERE act_id = ?`,
    [actTitle, actDate, actLocation, actId]
  );
}

async function remove(actId) {
  await pool.query(`DELETE FROM tb_activity WHERE act_id = ?`, [actId]);
}

module.exports = { findAll, findById, create, update, remove };