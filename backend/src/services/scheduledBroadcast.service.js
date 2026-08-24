const scheduledBroadcastModel = require('../models/scheduledBroadcast.model');
const newsModel = require('../models/news.model');
const broadcastService = require('./broadcast.service');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

/**
 * สร้างตารางส่งข่าวล่วงหน้า (Admin เท่านั้น)
 * @param {string} newsId
 * @param {object} data - { zoneName, scheduledAt } (scheduledAt = "YYYY-MM-DDTHH:mm" จาก datetime-local)
 * @param {object} currentUser - จาก JWT middleware
 */
async function scheduleNews(newsId, data, currentUser) {
  if (currentUser.roleName !== 'Admin') {
    throwError('เฉพาะผู้ใหญ่บ้านเท่านั้นที่ตั้งเวลาส่งข่าวได้', 403);
  }

  const { zoneName, scheduledAt } = data;

  // validate รูปแบบเวลา + ต้องเป็นอนาคตเท่านั้น
  const targetDate = new Date(scheduledAt);
  if (!scheduledAt || Number.isNaN(targetDate.getTime())) {
    throwError('รูปแบบวันเวลาไม่ถูกต้อง', 400);
  }
  if (targetDate.getTime() <= Date.now()) {
    throwError('ต้องตั้งเวลาส่งเป็นเวลาในอนาคตเท่านั้น', 400);
  }

  const news = await newsModel.findById(newsId);
  if (!news) throwError('ไม่พบข่าวนี้', 404);

  if (news.news_status !== 'Approved') {
    throwError('ตั้งเวลาส่งได้เฉพาะข่าวที่อนุมัติแล้วเท่านั้น', 400);
  }

  const scheduleId = await scheduledBroadcastModel.createSchedule({
    newsId,
    sentBy: currentUser.userId,
    zoneName,
    // MySQL รุ่นเกินไม่รับตัวคั่น "T" จาก <input type="datetime-local"> -> เปลี่ยนเป็นช่องว่าง
    scheduledAt: scheduledAt.replace('T', ' '),
  });

  return {
    scheduleId,
    newsTitle: news.news_title,
    zoneName: zoneName || 'ทั้งหมด',
    scheduledAt: targetDate.toISOString(),
  };
}

async function getSchedules(status) {
  return scheduledBroadcastModel.findSchedules(status || null);
}

/**
 * ยกเลิกตารางส่ง — ยกเลิกได้เฉพาะงานที่ยัง Pending (Admin เท่านั้น)
 */
async function cancelSchedule(scheduleId, currentUser) {
  if (currentUser.roleName !== 'Admin') {
    throwError('เฉพาะผู้ใหญ่บ้านเท่านั้นที่ยกเลิกตารางส่งได้', 403);
  }

  const schedule = await scheduledBroadcastModel.findScheduleById(scheduleId);
  if (!schedule) throwError('ไม่พบตารางส่งข่าวนี้', 404);

  const cancelled = await scheduledBroadcastModel.cancelSchedule(scheduleId);
  if (!cancelled) {
    throwError(`ยกเลิกไม่ได้ เพราะงานนี้มีสถานะ "${schedule.status}" แล้ว`, 400);
  }

  return { scheduleId };
}

/**
 * ประมวลผลงานที่ถึงเวลาส่ง — เรียกโดย cron job (ทุกนาที) และตอน startup
 * claim ทีละงานก่อนส่ง เพื่อกันส่งซ้ำกรณี job วิ่งชนกัน
 */
async function processDueSchedules() {
  const dueJobs = await scheduledBroadcastModel.findDueSchedules();
  const results = [];

  for (const job of dueJobs) {
    // ล็อคงานก่อน ถ้าล็อคไม่ได้แปลว่ามี process อื่นกำลังส่งอยู่ -> ข้าม
    const claimed = await scheduledBroadcastModel.claimSchedule(job.schedule_id);
    if (!claimed) continue;

    try {
      const result = await broadcastService.executeBroadcast(job.news_id, job.zone_name, job.sent_by);
      await scheduledBroadcastModel.markSent(job.schedule_id);
      console.log(
        `[scheduler] ส่งข่าว schedule #${job.schedule_id} สำเร็จ ถึง ${result.totalReceived} คน`
      );
      results.push({ scheduleId: job.schedule_id, status: 'Sent', totalReceived: result.totalReceived });
    } catch (err) {
      await scheduledBroadcastModel.markFailed(job.schedule_id, err.message);
      console.error(`[scheduler] ส่งข่าว schedule #${job.schedule_id} ไม่สำเร็จ:`, err.message);
      results.push({ scheduleId: job.schedule_id, status: 'Failed', error: err.message });
    }
  }

  return results;
}

/**
 * เก็บงานค้างจาก crash — งานที่ติดสถานะ 'Sending' นานเกิน (server ดับกลางคัน)
 * โยนกลับเป็น Pending ให้รอบถัดไปส่งใหม่
 */
async function resetStaleSchedules(staleMinutes) {
  return scheduledBroadcastModel.resetStaleSending(staleMinutes);
}

module.exports = { scheduleNews, getSchedules, cancelSchedule, processDueSchedules, resetStaleSchedules };
