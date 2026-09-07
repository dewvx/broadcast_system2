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
 * รองรับการค้นหาแบบ 2 ทิศทาง (Bidirectional Matching):
 * 1. เงื่อนไขแรก: กรณีข้อความยาวกว่า keyword (พฤติกรรมเดิม) เช่น พิมพ์ "อยากทราบเวลาเปิดทำการหน่อยครับ" ตรงกับ keyword "เวลาเปิดทำการ"
 * 2. เงื่อนไขสอง: กรณีข้อความสั้นกว่า keyword (เคสใหม่ที่ต้องการแก้) เช่น พิมพ์ "เวลาเปิด" ตรงกับ keyword "เวลาเปิดทำการ"
 *    - จำกัดความยาวข้อความขั้นต่ำ (CHAR_LENGTH >= 4) เพื่อป้องกันคำสั้นเกินไป match ผิดกลุ่ม (เช่น พิมพ์คำสั้นมั่วๆ แล้ว match โดน)
 * 3. จัดเรียงด้วย ORDER BY CHAR_LENGTH(question_key) DESC: หากจับคู่เจอหลายข้อ จะเลือก FAQ ที่มี keyword ยาวและเจาะจงที่สุดก่อน
 */
async function findMatchByMessage(messageText) {
  const [rows] = await pool.query(
    `SELECT * FROM tb_chatbot_faq
     WHERE (? LIKE CONCAT('%', question_key, '%'))
        OR (CHAR_LENGTH(?) >= 4 AND question_key LIKE CONCAT('%', ?, '%'))
     ORDER BY CHAR_LENGTH(question_key) DESC
     LIMIT 1`,
    [messageText, messageText, messageText]
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