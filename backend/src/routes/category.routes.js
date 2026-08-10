const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ดูหมวดหมู่ได้ทั้ง Admin และ Leader (แค่ login ก็พอ)
router.get('/', authMiddleware, categoryController.getAll);
router.get('/:id', authMiddleware, categoryController.getOne);

// จัดการหมวดหมู่ได้เฉพาะ Admin เท่านั้น
router.post('/', authMiddleware, roleMiddleware(['Admin']), categoryController.create);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), categoryController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), categoryController.remove);

module.exports = router;