const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.username, u.full_name, u.phone_number, u.position_title, u.line_user_id, u.role_id, r.role_name
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
    `SELECT u.user_id, u.username, u.password, u.full_name, u.phone_number, u.position_title, u.line_user_id, u.role_id, r.role_name
     FROM tb_user u
     JOIN tb_role r ON u.role_id = r.role_id
     WHERE u.username = ?`,
    [username]
  );
  return rows[0] || null;
}

async function findById(userId) {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.username, u.full_name, u.phone_number, u.position_title, u.line_user_id, u.role_id, r.role_name
     FROM tb_user u
     JOIN tb_role r ON u.role_id = r.role_id
     WHERE u.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

/**
 * ดึงรายชื่อผู้ติดต่อผู้นำชุมชนสำหรับแสดงในหน้าลูกบ้าน (LIFF)
 * ดึงเฉพาะ full_name, phone_number, position_title ของคนที่มีเบอร์โทร
 * ไม่ส่งข้อมูล sensitive อื่นๆ (username, password, line_user_id) เด็ดขาด
 */
async function findPublicContacts() {
  const [rows] = await pool.query(
    `SELECT u.full_name, u.phone_number, u.position_title
     FROM tb_user u
     JOIN tb_role r ON u.role_id = r.role_id
     WHERE u.phone_number IS NOT NULL AND TRIM(u.phone_number) != ''
     ORDER BY u.role_id ASC, u.user_id ASC`
  );
  return rows;
}

async function create({ username, hashedPassword, fullName, phoneNumber, positionTitle, roleId, lineUserId }) {
  const [result] = await pool.query(
    `INSERT INTO tb_user (username, password, full_name, phone_number, position_title, line_user_id, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [username, hashedPassword, fullName, phoneNumber || null, positionTitle || null, lineUserId || null, roleId]
  );
  return result.insertId;
}

async function update(userId, { fullName, phoneNumber, positionTitle, roleId, hashedPassword, lineUserId }) {
  const fields = ['full_name = ?'];
  const params = [fullName];

  if (phoneNumber !== undefined) {
    fields.push('phone_number = ?');
    params.push(phoneNumber ? phoneNumber.trim() : null);
  }

  if (positionTitle !== undefined) {
    fields.push('position_title = ?');
    params.push(positionTitle ? positionTitle.trim() : null);
  }

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

/**
 * นับจำนวนเนื้อหาและข้อมูลในระบบที่ผูกกับ user_id นี้
 * (ข่าว, กิจกรรม, เอกสาร, FAQ, รายการบรอดแคสต์) เพื่อป้องกัน FK constraint error ก่อนลบ
 */
async function countUserContent(userId) {
  const [rows] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM tb_news WHERE created_by = ? OR approved_by = ?) AS news_count,
       (SELECT COUNT(*) FROM tb_activity WHERE created_by = ?) AS activity_count,
       (SELECT COUNT(*) FROM tb_document WHERE created_by = ?) AS document_count,
       (SELECT COUNT(*) FROM tb_chatbot_faq WHERE created_by = ?) AS faq_count,
       (SELECT COUNT(*) FROM tb_broadcast_log WHERE sent_by = ?) AS broadcast_count,
       (SELECT COUNT(*) FROM tb_scheduled_broadcast WHERE sent_by = ?) AS schedule_count`,
    [userId, userId, userId, userId, userId, userId, userId]
  );
  const row = rows[0];
  const total =
    Number(row.news_count) +
    Number(row.activity_count) +
    Number(row.document_count) +
    Number(row.faq_count) +
    Number(row.broadcast_count) +
    Number(row.schedule_count);
  return { ...row, total };
}

module.exports = {
  findAll,
  findAllRoles,
  findByUsername,
  findById,
  findPublicContacts,
  create,
  update,
  updatePassword,
  remove,
  countUserContent,
};