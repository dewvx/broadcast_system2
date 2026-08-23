const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.username, u.full_name, u.line_user_id, u.role_id, r.role_name
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
    `SELECT u.user_id, u.username, u.password, u.full_name, u.line_user_id, u.role_id, r.role_name
     FROM tb_user u
     JOIN tb_role r ON u.role_id = r.role_id
     WHERE u.username = ?`,
    [username]
  );
  return rows[0] || null;
}

async function findById(userId) {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.username, u.full_name, u.line_user_id, u.role_id, r.role_name
     FROM tb_user u
     JOIN tb_role r ON u.role_id = r.role_id
     WHERE u.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

async function create({ username, hashedPassword, fullName, roleId, lineUserId }) {
  const [result] = await pool.query(
    `INSERT INTO tb_user (username, password, full_name, line_user_id, role_id) VALUES (?, ?, ?, ?, ?)`,
    [username, hashedPassword, fullName, lineUserId || null, roleId]
  );
  return result.insertId;
}

async function update(userId, { fullName, roleId, hashedPassword, lineUserId }) {
  const fields = ['full_name = ?'];
  const params = [fullName];

  if (roleId) {
    fields.push('role_id = ?');
    params.push(roleId);
  }

  if (lineUserId !== undefined) {
    fields.push('line_user_id = ?');
    params.push(lineUserId || null);
  }

  if (hashedPassword) {
    fields.push('password = ?');
    params.push(hashedPassword);
  }

  params.push(userId);

  await pool.query(
    `UPDATE tb_user SET ${fields.join(', ')} WHERE user_id = ?`,
    params
  );
}

async function updatePassword(userId, hashedPassword) {
  await pool.query(
    `UPDATE tb_user SET password = ? WHERE user_id = ?`,
    [hashedPassword, userId]
  );
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
  updatePassword,
  remove,
};