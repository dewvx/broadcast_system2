const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zone.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ดึงรายการซอย/คุ้มทั้งหมด (เปิดเป็น public เพื่อให้หน้าลงทะเบียน/แก้ไขข้อมูลลูกบ้าน LIFF และ Admin ดึงไปแสดง dropdown ได้)
router.get('/public', zoneController.getAll);
router.get('/', zoneController.getAll);
router.get('/:id', zoneController.getOne);

// จัดการซอย/คุ้ม (เฉพาะผู้ใหญ่บ้าน Admin เท่านั้น)
router.post('/', authMiddleware, roleMiddleware(['Admin']), zoneController.create);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), zoneController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), zoneController.remove);

module.exports = router;
