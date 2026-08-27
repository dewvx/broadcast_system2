const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ดูหมวดหมู่ข่าวสาร (เปิดเป็น public เพื่อให้ลูกบ้าน LIFF และ Admin ดึงไปแสดงแท็บได้)
router.get('/public', categoryController.getAll);
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getOne);

// จัดการหมวดหมู่ได้เฉพาะ Admin เท่านั้น
router.post('/', authMiddleware, roleMiddleware(['Admin']), categoryController.create);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), categoryController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), categoryController.remove);

module.exports = router;