/**
 * สคริปต์ทดสอบยิง Push Message ไปหา user คนเดียว (ไม่ใช่ broadcast จริง)
 * ใช้ตอน dev เพื่อเช็คว่า Channel Access Token ใช้งานได้จริง
 *
 * วิธีรัน:
 *   node scripts/testPush.js <LINE_USER_ID>
 *
 * หา LINE_USER_ID ได้จาก log ใน terminal ตอนพิมพ์ข้อความคุยกับ OA
 * (ดูใน src/controllers/webhook.controller.js -> console.log(event))
 */

require('dotenv').config();
const { lineClient } = require('../src/config/line');

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('ใส่ LINE User ID ด้วยครับ เช่น: node scripts/testPush.js U1234567890abcdef');
    process.exit(1);
  }

  try {
    await lineClient.pushMessage({
      to: userId,
      messages: [
        {
          type: 'text',
          text: 'ทดสอบส่งข่าวจากระบบหอกระจายข่าวชุมชน ✅ ถ้าได้รับข้อความนี้ แปลว่า Push Message ทำงานถูกต้อง',
        },
      ],
    });

    console.log('ส่งสำเร็จ! เช็คในแชท LINE ได้เลย');
  } catch (err) {
    console.error('ส่งไม่สำเร็จ:', err.originalError?.response?.data || err.message);
  }
}

main();
