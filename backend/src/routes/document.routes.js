const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const uploadDocument = require('../middlewares/documentUpload.middleware');

router.get('/', authMiddleware, documentController.getAll);
router.get('/:id', authMiddleware, documentController.getOne);

// สร้าง (อัปโหลดไฟล์) - Admin และ Leader
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Admin', 'Leader']),
  uploadDocument.single('document'),
  documentController.create
);

// ลบ - Admin เท่านั้น
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), documentController.remove);

module.exports = router;