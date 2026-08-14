const { lineClient } = require('../config/line');
const chatbotService = require('../services/chatbot.service');

/**
 * จัดการ event แต่ละตัวที่ LINE ส่งเข้ามา
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
        const answer = await chatbotService.findAnswer(event.message.text);
        return lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: answer }],
        });
      }
      return Promise.resolve(null);

    default:
      return Promise.resolve(null);
  }
}

module.exports = { handleEvent };