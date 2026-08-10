const { lineClient } = require('../config/line');

/**
 * จัดการ event แต่ละตัวที่ LINE ส่งเข้ามา
 * ตอนนี้ทำแค่ log + reply พื้นฐาน ไว้ต่อยอด logic
 * (chatbot keyword, บันทึกลง tb_villager ตอน follow ฯลฯ) ทีหลัง
 */
async function handleEvent(event) {
  console.log('Received LINE event:', JSON.stringify(event, null, 2));

  switch (event.type) {
    case 'follow':
      // TODO: บันทึก line_user_id ลง tb_villager ถ้ายังไม่มี (ดู docs/LINE_INTEGRATION.md)
      return lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: 'ยินดีต้อนรับสู่ระบบหอกระจายข่าวชุมชนครับ' }],
      });

    case 'message':
      if (event.message.type === 'text') {
        // TODO: ส่งต่อให้ chatbot.service.js ค้นหา keyword ใน tb_chatbot_faq
        return lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: `รับข้อความแล้ว: ${event.message.text}` }],
        });
      }
      return Promise.resolve(null);

    default:
      return Promise.resolve(null);
  }
}

module.exports = { handleEvent };
