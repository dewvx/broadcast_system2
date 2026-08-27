const cron = require('node-cron');
const scheduledBroadcastService = require('../services/scheduledBroadcast.service');

const STALE_SENDING_MINUTES = 10;

/**
 * Scheduler สำหรับ "ตั้งเวลาส่งข่าวล่วงหน้า" (ฟีเจอร์ 3.7)
 * วิ่งทุกนาที หยิบงาน Pending ที่ถึงเวลา (รวม overdue กรณี server ดับช่วงเวลาที่ต้องส่ง) มาส่ง
 * เรียกใช้ครั้งเดียวจาก server.js
 */
function startBroadcastScheduler() {
  // เก็บงานค้าง: งานที่ติด 'Sending' ค้างนานเกิน (crash กลางคัน) โยนกลับ Pending
  scheduledBroadcastService
    .processDueSchedules()
    .then((results) => {
      if (results.length > 0) {
        console.log(`[scheduler] startup: ประมวลผลงาน overdue ${results.length} รายการ`);
      }
    })
    .catch((err) => console.error('[scheduler] startup error:', err.message));

  cron.schedule('* * * * *', async () => {
    try {
      // รอบแรกของทิค: เก็บงานที่ติด 'Sending' ค้างจาก crash ให้กลับมา Pending
      const resetCount = await scheduledBroadcastService.resetStaleSchedules(STALE_SENDING_MINUTES);
      if (resetCount > 0) {
        console.warn(`[scheduler] พบงาน Sending ค้าง ${resetCount} รายการ โยนกลับไป Pending แล้ว`);
      }
      await scheduledBroadcastService.processDueSchedules();
    } catch (err) {
      console.error('[scheduler] error:', err.message);
    }
  });

  console.log('[scheduler] broadcast scheduler started (runs every minute)');
}

module.exports = { startBroadcastScheduler };
