const chatbotFaqModel = require('../models/chatbotFaq.model');
const chatbotLogModel = require('../models/chatbotLog.model');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

/**
 * ดึง LIFF base URL จาก env — ห้ามมีค่า default เพราะ deep link ผิด
 * จะชี้ไป OA channel อื่นโดยไม่รู้ตัว
 */
function getLiffBaseUrl() {
  if (!process.env.LIFF_ID) {
    throwError('ยังไม่ได้ตั้งค่า LIFF_ID ใน .env กรุณาตั้งค่าก่อนใช้งานแชทบอท', 500);
  }
  return `https://liff.line.me/${process.env.LIFF_ID}`;
}

/**
 * สร้าง Flex Message จากข้อความที่มีลิงก์
 */
function buildFlexMessage(text) {
  // รองรับทั้ง path แบบ /news/13, /liff/news/13 หรือ Full URL ที่มีทั้งสองรูปแบบ
  const newsMatch = text.match(/\/(?:liff\/)?news\/(\d+)/);

  if (newsMatch) {
    const newsId = newsMatch[1];
    const liffBaseUrl = getLiffBaseUrl();
    // ใช้รูปแบบลิงก์เดียวกับ broadcast (ไม่มี /liff นำหน้า) เพื่อให้ LIFF deep link เปิดตรงข่าว
    const url = `${liffBaseUrl}/news/${newsId}`;

    // ลบส่วนที่เป็นลิงก์ออกเพื่อไม่ให้มันซ้ำซ้อนในเนื้อหา
    const cleanText = text.replace(newsMatch[0], '').replace(liffBaseUrl, '').trim();
    
    return {
      type: 'flex',
      altText: 'มีข่าวสารใหม่จากหอกระจายข่าว',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'text', text: '📢 ประกาศจากชุมชน', weight: 'bold', size: 'md', color: '#16a34a' },
            { type: 'text', text: cleanText || 'คลิกปุ่มด้านล่างเพื่ออ่านรายละเอียด', margin: 'md', wrap: true }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [{ type: 'button', style: 'primary', color: '#16a34a', action: { type: 'uri', label: 'อ่านรายละเอียด', uri: url } }]
        }
      }
    };
  }

  // กรณีอื่นๆ ส่งกลับเป็น Text
  return { type: 'text', text: text };
}

/**
 * หาคำตอบและจัดรูปแบบข้อความ
 */
async function findAnswer(messageText, lineUserId) {
  const faq = await chatbotFaqModel.findMatchByMessage(messageText);
  let answerText = 'ขออภัย ไม่พบข้อมูลที่ค้นหา กรุณาติดต่อผู้ใหญ่บ้านโดยตรง หรือลองพิมพ์คำถามด้วยคำอื่น';
  let isMatched = false;

  if (faq) {
    answerText = faq.answer_text;
    isMatched = true;
  }

  // อัตโนมัติ: ถ้ามี path ในข้อความ ให้เติม URL เต็ม (รูปแบบเดียวกับ broadcast deep link)
  const liffBaseUrl = getLiffBaseUrl();
  let formattedAnswer = answerText
    .replace(/\/liff\/news\//g, '/news/')
    .replace(/\/news\//g, `${liffBaseUrl}/news/`)
    .replace(/\/uploads\//g, `${process.env.PUBLIC_APP_URL}/uploads/`);

  const responseMessage = buildFlexMessage(formattedAnswer);

  if (lineUserId) {
    chatbotLogModel.create({
      lineUserId,
      messageText,
      responseText: formattedAnswer,
      isMatched
    }).catch(err => console.error('Error saving chatbot log:', err));
  }

  return responseMessage;
}

// ----- FAQ CRUD สำหรับ Admin จัดการคำถาม-คำตอบ -----

async function getAllFaqs() {
  return chatbotFaqModel.findAll();
}

async function createFaq({ questionKey, answerText }, currentUser) {
  if (!questionKey || !questionKey.trim() || !answerText || !answerText.trim()) {
    throwError('กรุณากรอกคำถามและคำตอบให้ครบ', 400);
  }

  const faqId = await chatbotFaqModel.create({
    questionKey: questionKey.trim(),
    answerText: answerText.trim(),
    createdBy: currentUser.userId,
  });

  return chatbotFaqModel.findById(faqId);
}

async function updateFaq(faqId, { questionKey, answerText }) {
  const faq = await chatbotFaqModel.findById(faqId);
  if (!faq) throwError('ไม่พบคำถามนี้', 404);

  if (!questionKey || !questionKey.trim() || !answerText || !answerText.trim()) {
    throwError('กรุณากรอกคำถามและคำตอบให้ครบ', 400);
  }

  await chatbotFaqModel.update(faqId, { questionKey: questionKey.trim(), answerText: answerText.trim() });
  return chatbotFaqModel.findById(faqId);
}

async function deleteFaq(faqId) {
  const faq = await chatbotFaqModel.findById(faqId);
  if (!faq) throwError('ไม่พบคำถามนี้', 404);

  await chatbotFaqModel.remove(faqId);
}

// ----- Inquiry Logs สำหรับ Admin -----

async function getInquiryLogs({ limit = 100, offset = 0 } = {}) {
  const logs = await chatbotLogModel.findAll({ limit, offset });
  const total = await chatbotLogModel.countAll();
  return { logs, total };
}

module.exports = { findAnswer, getAllFaqs, createFaq, updateFaq, deleteFaq, getInquiryLogs };
