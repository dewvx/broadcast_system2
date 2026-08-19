const express = require('express');
const router = express.Router();
const villagerController = require('../controllers/villager.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const liffAuthMiddleware = require('../middlewares/liffAuth.middleware');

router.post('/check', villagerController.checkOrLogin);
router.post('/register', villagerController.register);

// ดูรายการข่าวสาร (ข่าวสาธารณะ - optional auth)
router.post('/news', liffAuthMiddleware({ optional: true }), villagerController.getNews);

// ดูปฏิทินกิจกรรม และ แบบฟอร์มเอกสาร (ฝั่งลูกบ้าน LIFF - ใช้ liffAuthMiddleware)
router.post('/activities', liffAuthMiddleware({ optional: true }), villagerController.getActivities);
router.post('/activities/:id', liffAuthMiddleware({ optional: true }), villagerController.getActivityDetail);
router.get('/activities/public/:id', villagerController.getActivityDetail);
router.post('/documents', liffAuthMiddleware({ optional: false }), villagerController.getDocuments);

// Admin ดูรายชื่อลูกบ้านทั้งหมด (ใช้ JWT auth ปกติ)
router.get('/', authMiddleware, roleMiddleware(['Admin']), villagerController.getAll);

module.exports = router;