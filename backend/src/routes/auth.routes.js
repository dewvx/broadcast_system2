const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);

// ขอ OTP รีเซ็ตรหัสผ่านผ่าน LINE OA (Public)
router.post('/forgot-password', authController.forgotPassword);

// ยืนยัน OTP และตั้งรหัสผ่านใหม่ (Public)
router.post('/reset-password', authController.resetPassword);

module.exports = router;