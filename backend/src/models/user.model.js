const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.username, u.full_name, u.role_id, r.role_name
     FROM tb_user u
     JOIN tb_role r ON u.role_id = r.role_id
     ORDER BY u.user_id ASC`
  );
  return rows;
}

async function findAllRoles() {
  const [rows] = await pool.query(
    `SELECT role_id, role_name, role_description FROM tb_role WHERE role_name IN ('Admin', 'Leader') ORDER BY role_id ASC`
  );
  return rows;
}

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

async function update(userId, { fullName, roleId, hashedPassword }) {
  if (hashedPassword) {
    await pool.query(
      `UPDATE tb_user SET full_name = ?, role_id = ?, password = ? WHERE user_id = ?`,
      [fullName, roleId, hashedPassword, userId]
    );
  } else {
    await pool.query(
      `UPDATE tb_user SET full_name = ?, role_id = ? WHERE user_id = ?`,
      [fullName, roleId, userId]
    );
  }
}

async function remove(userId) {
  await pool.query(`DELETE FROM tb_user WHERE user_id = ?`, [userId]);
}

module.exports = {
  findAll,
  findAllRoles,
  findByUsername,
  findById,
  create,
  update,
  remove,
};