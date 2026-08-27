const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT f.faq_id, f.question_key, f.answer_text, f.created_by, u.full_name AS created_by_name
     FROM tb_chatbot_faq f
     JOIN tb_user u ON f.created_by = u.user_id
     ORDER BY f.faq_id DESC`
  );
  return rows;
}

async function findById(faqId) {
  const [rows] = await pool.query(`SELECT * FROM tb_chatbot_faq WHERE faq_id = ?`, [faqId]);
  return rows[0] || null;
}

/**
 * หาคำตอบที่ตรงกับข้อความที่ลูกบ้านพิมพ์มา
 * ใช้ LIKE แบบ "ข้อความมี keyword อยู่ตรงไหนก็ได้" (ไม่ต้องพิมพ์ตรงเป๊ะ)
 * เช่น question_key = "เวลาเปิด" จะ match ทั้ง "เวลาเปิดกี่โมง" และ "อยากรู้เวลาเปิด"
 */
async function findMatchByMessage(messageText) {
  const [rows] = await pool.query(
    `SELECT * FROM tb_chatbot_faq WHERE ? LIKE CONCAT('%', question_key, '%') LIMIT 1`,
    [messageText]
  );
  return rows[0] || null;
}

async function create({ questionKey, answerText, createdBy }) {
  const [result] = await pool.query(
    `INSERT INTO tb_chatbot_faq (question_key, answer_text, created_by) VALUES (?, ?, ?)`,
    [questionKey, answerText, createdBy]
  );
  return result.insertId;
}

async function update(faqId, { questionKey, answerText }) {
  await pool.query(
    `UPDATE tb_chatbot_faq SET question_key = ?, answer_text = ? WHERE faq_id = ?`,
    [questionKey, answerText, faqId]
  );
}

async function remove(faqId) {
  await pool.query(`DELETE FROM tb_chatbot_faq WHERE faq_id = ?`, [faqId]);
}

module.exports = { findAll, findById, findMatchByMessage, create, update, remove };