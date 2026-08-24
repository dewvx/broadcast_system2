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

async function getLogs(req, res, next) {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const result = await chatbotService.getInquiryLogs({ limit, offset });
    res.json({ 
      success: true, 
      data: result.logs, 
      total: result.total 
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove, getLogs };
