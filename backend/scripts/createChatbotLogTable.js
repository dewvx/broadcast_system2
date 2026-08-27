require('dotenv').config();
const pool = require('../src/config/db');

async function main() {
  console.log('กำลังสร้างตาราง tb_chatbot_log ในฐานข้อมูล...');
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS tb_chatbot_log (
      log_id INT AUTO_INCREMENT PRIMARY KEY,
      line_user_id VARCHAR(100) NOT NULL,
      message_text TEXT NOT NULL,
      response_text TEXT NOT NULL,
      is_matched TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  try {
    await pool.query(createTableSql);
    console.log('สร้างตาราง tb_chatbot_log สำเร็จ หรือ มีตารางนี้อยู่แล้ว!');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างตาราง:', error);
  } finally {
    await pool.end();
  }
}

main();
