const express = require('express');
const router = express.Router();
const broadcastController = require('../controllers/broadcast.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ดึงรายชื่อโซนที่มีลูกบ้านอยู่จริง - Admin เห็นตอนเลือกกลุ่มผู้รับ
router.get('/zones', authMiddleware, roleMiddleware(['Admin']), broadcastController.getZones);

// รายการตารางส่งข่าวล่วงหน้า (?status=Pending เฉพาะที่รอส่ง / ไม่ส่ง = ทุกสถานะ) - Admin
// (ต้องประกาศก่อน route /:newsId ไม่งั้น "schedule" ถูก interpret เป็น newsId)
router.get('/scheduled', authMiddleware, roleMiddleware(['Admin']), broadcastController.getScheduledList);

// ตั้งเวลาส่งข่าวล่วงหน้า - Admin เท่านั้น (body: zoneName?, scheduledAt "YYYY-MM-DDTHH:mm")
router.post('/:newsId/schedule', authMiddleware, roleMiddleware(['Admin']), broadcastController.scheduleBroadcast);

// ยกเลิกตารางส่งข่าว (ได้เฉพาะสถานะ Pending) - Admin เท่านั้น
router.delete('/schedule/:scheduleId', authMiddleware, roleMiddleware(['Admin']), broadcastController.cancelScheduled);

// ส่งข่าวทันทีผ่าน LINE - Admin เท่านั้น
router.post('/:newsId', authMiddleware, roleMiddleware(['Admin']), broadcastController.broadcast);

module.exports = router;