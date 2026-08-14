const express = require('express');
const router = express.Router();
const chatbotFaqController = require('../controllers/chatbotfaq.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ดูคำถาม-คำตอบทั้งหมด - Admin เท่านั้น (Leader ไม่เกี่ยวกับการจัดการ FAQ)
router.get('/', authMiddleware, roleMiddleware(['Admin']), chatbotFaqController.getAll);
router.post('/', authMiddleware, roleMiddleware(['Admin']), chatbotFaqController.create);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), chatbotFaqController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), chatbotFaqController.remove);

module.exports = router;