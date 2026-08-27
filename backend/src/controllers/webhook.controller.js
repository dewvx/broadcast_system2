const { lineClient } = require('../config/line');
const chatbotService = require('../services/chatbot.service');
const villagerService = require('../services/villager.service');

/**
 * จัดการ event แต่ละตัวที่ LINE ส่งเข้ามา
 */
async function handleEvent(event) {
  switch (event.type) {
    case 'follow':
      // เมื่อลูกบ้านแอดเพื่อน หรือ ปลดบล็อก LINE OA
      if (event.source && event.source.userId) {
        try {
          await villagerService.setVillagerActiveStatus(event.source.userId, 1);
        } catch (err) {
          console.warn('Failed to update active status on follow:', err);
        }
      }

      return lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: 'ยินดีต้อนรับสู่ระบบหอกระจายข่าวชุมชนครับ' }],
      });

    case 'unfollow':
      // เมื่อลูกบ้านบล็อก หรือ ลบเพื่อน LINE OA -> ปรับ is_active = 0
      if (event.source && event.source.userId) {
        try {
          await villagerService.setVillagerActiveStatus(event.source.userId, 0);
          console.log(`Villager ${event.source.userId} unfollowed/blocked LINE OA. Marked is_active = 0.`);
        } catch (err) {
          console.warn('Failed to update active status on unfollow:', err);
        }
      }
      return Promise.resolve(null);

    case 'message':
      if (event.message.type === 'text') {
        const lineUserId = event.source ? event.source.userId : null;
        const responseMessage = await chatbotService.findAnswer(event.message.text, lineUserId);
        return lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [responseMessage],
        });
      }
      return Promise.resolve(null);

    default:
      return Promise.resolve(null);
  }
}

module.exports = { handleEvent };