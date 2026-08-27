const scheduledBroadcastModel = require('../models/scheduledBroadcast.model');
const newsModel = require('../models/news.model');
const broadcastService = require('./broadcast.service');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

// เวลาไทย = UTC+7 ตายตัว (Admin ใช้งานจากไทยเสมอ) — คำนวณ offset ตรงๆ ไม่พึ่ง TZ ของเครื่องที่รัน
const THAI_OFFSET_MS = 7 * 60 * 60 * 1000;

function padTwo(number) {
  return String(number).padStart(2, '0');
}

/**
 * แปลง "YYYY-MM-DDTHH:mm" จาก <input type="datetime-local"> (เวลาไทยเสมอ)
 * เป็น Date object (epoch UTC) — ใช้ Date.UTC + หัก offset 7 ชม. ตรงๆ
 * จึงได้ผลเหมือนกันไม่ว่า server รันอยู่ timezone ไหน
 * @returns {Date|null} null ถ้ารูปแบบ/วันที่ไม่ถูกต้อง
 */
function thaiInputToUtc(scheduledAt) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(scheduledAt).trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  // เช็ควันที่ตามปฏิทินจริง (กัน 2026-02-30 ฯลฯ) โดยตีความเป็น UTC ล้วนๆ ก่อน
  const naive = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    naive.getUTCFullYear() !== year ||
    naive.getUTCMonth() !== month - 1 ||
    naive.getUTCDate() !== day ||
    naive.getUTCHours() !== hour ||
    naive.getUTCMinutes() !== minute
  ) {
    return null;
  }

  // หัก 7 ชม. = แปลงจากเวลาไทย (+07:00) เป็น UTC อย่างชัดเจน
  return new Date(naive.getTime() - THAI_OFFSET_MS);
}

/**
 * ฟอร์แมต Date (epoch UTC) เป็นสตริง "YYYY-MM-DD HH:mm:ss" (ค่า UTC)
 * สำหรับเก็บลง MySQL DATETIME — เราเก็บ scheduled_at เป็น UTC เสมอ
 */
function formatUtcForMySql(utcDate) {
  return (
    `${utcDate.getUTCFullYear()}-${padTwo(utcDate.getUTCMonth() + 1)}-${padTwo(utcDate.getUTCDate())} ` +
    `${padTwo(utcDate.getUTCHours())}:${padTwo(utcDate.getUTCMinutes())}:${padTwo(utcDate.getUTCSeconds())}`
  );
}

/**
 * แปลงสตริง UTC จาก MySQL ("YYYY-MM-DD HH:mm:ss") เป็น ISO string เวลาไทย
 * เช่น "2026-08-25T12:00:00+07:00" — frontend ใช้ new Date(...) อ่านแล้วโชว์เวลาไทยถูกต้องเสมอ
 */
function utcMysqlToThaiIso(mysqlUtcString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(String(mysqlUtcString));
  if (!match) return null;

  const utcMs = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6])
  );
  const thai = new Date(utcMs + THAI_OFFSET_MS);

  return (
    `${thai.getUTCFullYear()}-${padTwo(thai.getUTCMonth() + 1)}-${padTwo(thai.getUTCDate())}` +
    `T${padTwo(thai.getUTCHours())}:${padTwo(thai.getUTCMinutes())}:${padTwo(thai.getUTCSeconds())}+07:00`
  );
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
  // ตีความ scheduledAt เป็นเวลาไทย (+07:00) เสมอ แล้วแปลงเป็น UTC ด้วย offset ตรงๆ
  const targetUtcDate = thaiInputToUtc(scheduledAt);
  if (!scheduledAt || !targetUtcDate) {
    throwError('รูปแบบวันเวลาไม่ถูกต้อง', 400);
  }
  if (targetUtcDate.getTime() <= Date.now()) {
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
    // เก็บลง MySQL เป็น UTC เสมอ (รูปแบบ "YYYY-MM-DD HH:mm:ss" ไม่มีตัวคั่น "T" ให้ MySQL รุ่นเกินติด)
    scheduledAt: formatUtcForMySql(targetUtcDate),
  });

  return {
    scheduleId,
    newsTitle: news.news_title,
    zoneName: zoneName || 'ทั้งหมด',
    scheduledAt: utcMysqlToThaiIso(formatUtcForMySql(targetUtcDate)),
  };
}

async function getSchedules(status) {
  const rows = await scheduledBroadcastModel.findSchedules(status || null);
  // scheduled_at ใน DB เป็น UTC — แปลงกลับเป็นเวลาไทย (+07:00) ก่อนส่งให้ Admin
  return rows.map((row) => ({
    ...row,
    scheduled_at: utcMysqlToThaiIso(row.scheduled_at) ?? row.scheduled_at,
  }));
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

module.exports = {
  scheduleNews,
  getSchedules,
  cancelSchedule,
  processDueSchedules,
  resetStaleSchedules,
  thaiInputToUtc,
  formatUtcForMySql,
  utcMysqlToThaiIso,
};
