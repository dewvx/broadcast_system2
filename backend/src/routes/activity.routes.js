const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ดูกิจกรรมได้ทั้ง Admin, Leader (แค่ login ก็พอ)
router.get('/', authMiddleware, activityController.getAll);
router.get('/:id', authMiddleware, activityController.getOne);

// สร้าง/แก้ไข ได้ทั้ง Admin และ Leader
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Leader']), activityController.create);
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Leader']), activityController.update);

// ลบ - Admin เท่านั้น
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), activityController.remove);

module.exports = router;