/**
 * ใช้คู่กับ auth.middleware.js เสมอ (ต้อง run auth.middleware ก่อน เพื่อให้มี req.user)
 *
 * ตัวอย่างการใช้:
 *   router.delete('/news/:id', authMiddleware, roleMiddleware(['Admin']), newsController.remove);
 *   router.post('/news', authMiddleware, roleMiddleware(['Admin', 'Leader']), newsController.create);
 */
function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้ กรุณา login ก่อน' });
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' });
    }

    next();
  };
}

module.exports = roleMiddleware;