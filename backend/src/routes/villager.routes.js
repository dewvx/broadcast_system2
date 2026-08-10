const express = require('express');
const router = express.Router();
const villagerController = require('../controllers/villager.controller');

// ไม่มี authMiddleware เพราะ auth ของฝั่งลูกบ้านคือ idToken เอง (verify กับ LINE ตรงใน service)
router.post('/check', villagerController.checkOrLogin);
router.post('/register', villagerController.register);

module.exports = router;