const pool = require('../config/db');

async function findByUsername(username) {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.username, u.password, u.full_name, u.role_id, r.role_name
     FROM tb_user u
     JOIN tb_role r ON u.role_id = r.role_id
     WHERE u.username = ?`,
    [username]
  );
  return rows[0] || null;
}

async function findById(userId) {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.username, u.full_name, u.role_id, r.role_name
     FROM tb_user u
     JOIN tb_role r ON u.role_id = r.role_id
     WHERE u.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

async function create({ username, hashedPassword, fullName, roleId }) {
  const [result] = await pool.query(
    `INSERT INTO tb_user (username, password, full_name, role_id) VALUES (?, ?, ?, ?)`,
    [username, hashedPassword, fullName, roleId]
  );
  return result.insertId;
}

module.exports = { findByUsername, findById, create };