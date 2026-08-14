const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

// ดูข่าวได้ทั้ง Admin และ Leader (แค่ login ก็พอ ไม่ต้องเช็ค role เพิ่ม)
router.get('/', authMiddleware, newsController.getAll);
router.get('/:id', authMiddleware, newsController.getOne);

// สร้างข่าวได้ทั้ง Admin และ Leader
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Leader']), newsController.create);

// แก้ไขข่าว - เช็ค role กว้างๆ ตรงนี้ก่อน ส่วนเงื่อนไข "เจ้าของ/สถานะ" เช็คใน service
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Leader']), newsController.update);

// อัปโหลดรูปภาพประกอบข่าว - Admin และ Leader (upload.single('image') ต้องมาก่อน controller)
router.post(
  '/:id/image',
  authMiddleware,
  roleMiddleware(['Admin', 'Leader']),
  upload.single('image'),
  newsController.uploadImage
);

// ดูรายละเอียดข่าว (ฝั่งลูกบ้าน) - ไม่มี authMiddleware เพราะใช้ idToken แทน (verify ใน service)
router.post('/:id/view', newsController.publicView);

// ลบข่าว - Admin เท่านั้น
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), newsController.remove);

// อนุมัติ/ปฏิเสธ - Admin เท่านั้น
router.patch('/:id/approve', authMiddleware, roleMiddleware(['Admin']), newsController.approve);
router.patch('/:id/reject', authMiddleware, roleMiddleware(['Admin']), newsController.reject);

module.exports = router;