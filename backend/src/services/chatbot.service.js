const chatbotFaqModel = require('../models/chatbotFaq.model');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

/**
 * หาคำตอบจากข้อความที่ลูกบ้านพิมพ์มา
 * เจอ -> return ข้อความคำตอบ
 * ไม่เจอ -> return ข้อความ fallback มาตรฐาน (ไม่ throw error เพราะ "ไม่พบ" เป็นผลลัพธ์ปกติ ไม่ใช่ข้อผิดพลาด)
 */
async function findAnswer(messageText) {
  const faq = await chatbotFaqModel.findMatchByMessage(messageText);

  if (faq) {
    return faq.answer_text;
  }

  return 'ขออภัย ไม่พบข้อมูลที่ค้นหา กรุณาติดต่อผู้ใหญ่บ้านโดยตรง หรือลองพิมพ์คำถามด้วยคำอื่น';
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

module.exports = { findAnswer, getAllFaqs, createFaq, updateFaq, deleteFaq };