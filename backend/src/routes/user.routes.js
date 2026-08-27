const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ดึงสิทธิ์ role ทั้งหมด (Admin)
router.get('/roles', authMiddleware, roleMiddleware(['Admin']), userController.getRoles);

// ดึงรายชื่อผู้ใช้ทั้งหมด (Admin, Leader)
router.get('/', authMiddleware, userController.getAll);

// เพิ่มผู้ใช้ใหม่ (Admin เท่านั้น)
router.post('/', authMiddleware, roleMiddleware(['Admin']), userController.create);

// แก้ไขข้อมูลผู้ใช้ / เปลี่ยนรหัสผ่าน (Admin หรือ เจ้าของบัญชี)
router.put('/:id', authMiddleware, userController.update);

// ลบผู้ใช้ (Admin เท่านั้น)
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), userController.remove);

module.exports = router;
