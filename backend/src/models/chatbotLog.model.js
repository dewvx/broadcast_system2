const pool = require('../config/db');

/**
 * บันทึกประวัติการสอบถาม
 */
async function create({ lineUserId, messageText, responseText, isMatched }) {
  const [result] = await pool.query(
    `INSERT INTO tb_chatbot_log (line_user_id, message_text, response_text, is_matched) 
     VALUES (?, ?, ?, ?)`,
    [lineUserId, messageText, responseText, isMatched ? 1 : 0]
  );
  return result.insertId;
}

/**
 * ดึงประวัติการสอบถามทั้งหมด (สำหรับ Admin ดู)
 * พร้อม Join ข้อมูลลูกบ้านถ้ามีในระบบ
 */
async function findAll({ limit = 100, offset = 0 } = {}) {
  const [rows] = await pool.query(
    `SELECT l.*, v.first_name, v.last_name, v.display_name, u.full_name as replied_by_name
     FROM tb_chatbot_log l
     LEFT JOIN tb_villager v ON l.line_user_id = v.line_user_id
     LEFT JOIN tb_user u ON l.replied_by = u.user_id
     ORDER BY l.created_at DESC
     LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)]
  );
  return rows;
}

async function findById(logId) {
  const [rows] = await pool.query(
    `SELECT l.*, v.first_name, v.last_name, v.display_name, u.full_name as replied_by_name
     FROM tb_chatbot_log l
     LEFT JOIN tb_villager v ON l.line_user_id = v.line_user_id
     LEFT JOIN tb_user u ON l.replied_by = u.user_id
     WHERE l.log_id = ?`,
    [logId]
  );
  return rows[0] || null;
}

async function updateReply(logId, { adminReply, repliedBy }) {
  await pool.query(
    `UPDATE tb_chatbot_log
     SET admin_reply = ?, replied_by = ?, replied_at = NOW()
     WHERE log_id = ?`,
    [adminReply, repliedBy, logId]
  );
}

/**
 * นับจำนวน log ทั้งหมดเพื่อใช้ทำ pagination
 */
async function countAll() {
  const [rows] = await pool.query(`SELECT COUNT(*) as total FROM tb_chatbot_log`);
  return rows[0].total;
}

module.exports = { create, findAll, findById, updateReply, countAll };
