const express = require('express');
const router = express.Router();
const broadcastController = require('../controllers/broadcast.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ดึงรายชื่อโซนที่มีลูกบ้านอยู่จริง - Admin เห็นตอนเลือกกลุ่มผู้รับ
router.get('/zones', authMiddleware, roleMiddleware(['Admin']), broadcastController.getZones);

// ส่งข่าวผ่าน LINE - Admin เท่านั้น
router.post('/:newsId', authMiddleware, roleMiddleware(['Admin']), broadcastController.broadcast);

module.exports = router;