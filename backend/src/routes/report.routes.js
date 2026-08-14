const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// รายงานทั้งหมดเป็น read-only - Admin ดูได้เต็ม, Leader ดูได้เหมือนกัน (ตาม docs/ROLES.md ระบุ view only)
router.get('/summary', authMiddleware, roleMiddleware(['Admin', 'Leader']), reportController.getSummary);
router.get('/top-news', authMiddleware, roleMiddleware(['Admin', 'Leader']), reportController.getTopNews);
router.get(
  '/broadcast-history',
  authMiddleware,
  roleMiddleware(['Admin', 'Leader']),
  reportController.getBroadcastHistory
);
router.get(
  '/news/:newsId/views',
  authMiddleware,
  roleMiddleware(['Admin', 'Leader']),
  reportController.getNewsViewCount
);

module.exports = router;