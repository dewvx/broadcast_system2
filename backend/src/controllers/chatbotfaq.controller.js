const chatbotService = require('../services/chatbot.service');

async function getAll(req, res, next) {
  try {
    const faqs = await chatbotService.getAllFaqs();
    res.json({ success: true, data: faqs });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const faq = await chatbotService.createFaq(req.body, req.user);
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const faq = await chatbotService.updateFaq(req.params.id, req.body);
    res.json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await chatbotService.deleteFaq(req.params.id);
    res.json({ success: true, message: 'ลบคำถามสำเร็จ' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove };