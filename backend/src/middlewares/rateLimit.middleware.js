const rateLimit = require('express-rate-limit');

/**
 * Rate limit สำหรับ endpoint รีเซ็ตรหัสผ่าน (public) — กันสแปมขอ OTP รัว
 * (LINE push message มี quota) และช่วยหนุนการ brute force OTP ให้ยากขึ้น
 * จำกัด 5 request / 15 นาที ต่อ IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'พยายามบ่อยเกินไป กรุณารอประมาณ 15 นาทีแล้วลองใหม่อีกครั้ง',
  },
});

/**
 * Rate limit สำหรับ endpoint เข้าสู่ระบบ (public) — ป้องกัน brute force รหัสผ่าน Admin / Leader
 * จำกัด 5 ครั้ง / 15 นาที ต่อ IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอประมาณ 15 นาทีแล้วลองใหม่อีกครั้ง',
  },
});

module.exports = { passwordResetLimiter, loginLimiter };
