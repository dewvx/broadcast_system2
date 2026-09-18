const chatbotFaqModel = require('../models/chatbotFaq.model');
const chatbotLogModel = require('../models/chatbotLog.model');
const { lineClient } = require('../config/line');

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
  let answerText =
    'ขออภัยครับ ระบบไม่พบข้อมูลที่ตรงกับคำถามของท่าน 🙏\n\n' +
    '📌 สิ่งที่ท่านสามารถทำได้:\n' +
    '1. พิมพ์คำถามทิ้งไว้ในแชทนี้ เพื่อให้ผู้ใหญ่บ้านหรือเจ้าหน้าที่เข้ามาตอบกลับโดยตรง\n' +
    '2. ลองพิมพ์คำถามใหม่โดยใช้คำสำคัญสั้นๆ (เช่น เวลาเปิดทำการ, ขยะ, ติดต่อ)';
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

async function replyToVillager(logId, adminReplyText, currentUser) {
  if (!adminReplyText || !adminReplyText.trim()) {
    throwError('กรุณากรอกข้อความที่จะตอบกลับ', 400);
  }

  const log = await chatbotLogModel.findById(logId);
  if (!log) {
    throwError('ไม่พบประวัติการสอบถามนี้', 404);
  }

  if (!log.line_user_id) {
    throwError('ไม่พบบัญชี LINE ของผู้สอบถาม ไม่สามารถส่งข้อความได้', 400);
  }

  const replyClean = adminReplyText.trim();
  const questionPreview = log.message_text
    ? (log.message_text.length > 60 ? log.message_text.slice(0, 60) + '...' : log.message_text)
    : '';

  const pushMessageText =
    `💬 [ตอบกลับจากผู้ใหญ่บ้าน/เจ้าหน้าที่]\n\n` +
    (questionPreview ? `อ้างถึงคำถาม: "${questionPreview}"\n\n` : '') +
    `${replyClean}`;

  try {
    await lineClient.pushMessage({
      to: log.line_user_id,
      messages: [
        {
          type: 'text',
          text: pushMessageText,
        },
      ],
    });
  } catch (err) {
    console.error('Failed to send LINE push reply:', err);
    throwError('ไม่สามารถส่งข้อความเข้า LINE ได้ กรุณาตรวจสอบว่าผู้ใช้ได้บล็อก LINE OA หรือไม่', 500);
  }

  await chatbotLogModel.updateReply(logId, {
    adminReply: replyClean,
    repliedBy: currentUser.userId,
  });

  return chatbotLogModel.findById(logId);
}

module.exports = { findAnswer, getAllFaqs, createFaq, updateFaq, deleteFaq, getInquiryLogs, replyToVillager };
