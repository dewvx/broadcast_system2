const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { passwordResetLimiter, loginLimiter } = require('../middlewares/rateLimit.middleware');

router.post('/login', loginLimiter, authController.login);
router.get('/me', authMiddleware, authController.me);

// ขอ OTP รีเซ็ตรหัสผ่านผ่าน LINE OA (Public) — rate limit กันสแปม
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);

// ยืนยัน OTP และตั้งรหัสผ่านใหม่ (Public) — rate limit กัน brute force OTP
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

module.exports = router;