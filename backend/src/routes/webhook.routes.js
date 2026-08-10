const express = require('express');
const router = express.Router();
const line = require('@line/bot-sdk');
const { lineConfig } = require('../config/line');
const { handleEvent } = require('../controllers/webhook.controller');

// line.middleware() ทำหน้าที่:
// 1. ตรวจสอบ signature ว่ามาจาก LINE จริง (ใช้ channelSecret)
// 2. parse body เป็น events array ให้อัตโนมัติ
router.post('/', line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;

    // ถ้า events ว่าง (กรณี LINE console กด Verify) ให้ตอบ 200 ทันที
    if (!events || events.length === 0) {
      return res.status(200).json({ message: 'No events (verify ping)' });
    }

    const results = await Promise.all(events.map(handleEvent));
    res.status(200).json(results);
  } catch (err) {
    console.error('Webhook error:', err);
    // อย่าตอบ error code กลับ LINE ไม่งั้น LINE จะ retry รัวๆ
    res.status(200).end();
  }
});

module.exports = router;
