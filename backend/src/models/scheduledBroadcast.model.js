const pool = require('../config/db');

/**
 * บันทึกตารางส่งข่าวใหม่
 * @param {object} data - { newsId, sentBy, zoneName, scheduledAt }
 */
async function createSchedule({ newsId, sentBy, zoneName, scheduledAt }) {
  const [result] = await pool.query(
    `INSERT INTO tb_scheduled_broadcast (news_id, sent_by, zone_name, scheduled_at)
     VALUES (?, ?, ?, ?)`,
    [newsId, sentBy, zoneName || null, scheduledAt]
  );
  return result.insertId;
}

/**
 * ดึงรายการตารางส่งข่าว (join ชื่อข่าว + ผู้ส่ง)
 * @param {string|null} status - filter ตามสถานะ ถ้า null = เอาทุกสถานะ
 */
async function findSchedules(status) {
  const params = [];
  let where = '';
  if (status) {
    where = 'WHERE sb.status = ?';
    params.push(status);
  }

  const [rows] = await pool.query(
    `SELECT sb.schedule_id, sb.news_id, n.news_title, n.news_status,
            sb.sent_by, u.full_name AS sent_by_name,
            sb.zone_name,
            DATE_FORMAT(sb.scheduled_at, '%Y-%m-%d %H:%i:%s') AS scheduled_at,
            sb.status, sb.error_message, sb.created_at
     FROM tb_scheduled_broadcast sb
     JOIN tb_news n ON sb.news_id = n.news_id
     JOIN tb_user u ON sb.sent_by = u.user_id
     ${where}
     ORDER BY sb.scheduled_at ASC`,
    params
  );
  return rows;
}

async function findScheduleById(scheduleId) {
  const [rows] = await pool.query(
    `SELECT schedule_id, news_id, sent_by, zone_name, scheduled_at, status
     FROM tb_scheduled_broadcast WHERE schedule_id = ?`,
    [scheduleId]
  );
  return rows[0] || null;
}

/**
 * ดึงงานที่ถึงเวลาส่งแล้ว (Pending และเวลาผ่านมาแล้ว)
 * ใช้ทั้งจาก cron ทุกนาที และตอน startup เพื่อเก็บงาน overdue จากตอน server ดับ
 * scheduled_at เก็บเป็น UTC เสมอ -> เทียบกับ UTC_TIMESTAMP() ไม่พึ่ง timezone ของ MySQL session
 */
async function findDueSchedules() {
  const [rows] = await pool.query(
    `SELECT schedule_id, news_id, sent_by, zone_name
     FROM tb_scheduled_broadcast
     WHERE status = 'Pending' AND scheduled_at <= UTC_TIMESTAMP()
     ORDER BY scheduled_at ASC`
  );
  return rows;
}

/**
 * "ล็อค" งานก่อนส่ง — update เฉพาะถ้ายังเป็น Pending (กันส่งซ้ำกรณี job วิ่งชนกัน/restart)
 * คืน true ถ้าล็อคสำเร็จ (เป็นเจ้าของงานนี้), false ถ้ามีคนอื่นล็อคไปก่อนแล้ว
 */
async function claimSchedule(scheduleId) {
  const [result] = await pool.query(
    `UPDATE tb_scheduled_broadcast SET status = 'Sending'
     WHERE schedule_id = ? AND status = 'Pending'`,
    [scheduleId]
  );
  return result.affectedRows > 0;
}

async function markSent(scheduleId) {
  await pool.query(`UPDATE tb_scheduled_broadcast SET status = 'Sent', error_message = NULL WHERE schedule_id = ?`, [
    scheduleId,
  ]);
}

async function markFailed(scheduleId, errorMessage) {
  // ส่งไม่สำเร็จ -> โยนกลับเป็น Failed พร้อมเหตุผล (Admin เห็นในรายการแล้วลองส่งใหม่เอง)
  const truncated = String(errorMessage).slice(0, 500);
  await pool.query(`UPDATE tb_scheduled_broadcast SET status = 'Failed', error_message = ? WHERE schedule_id = ?`, [
    truncated,
    scheduleId,
  ]);
}

/**
 * เก็บงานค้างจาก crash — งานที่ติด 'Sending' นานเกินไป (server ดับกลางคัน)
 * โยนกลับเป็น Pending ให้ scheduler ลองส่งใหม่
 * @param {number} staleMinutes - นาทีที่ถือว่าค้าง
 */
async function resetStaleSending(staleMinutes) {
  const [result] = await pool.query(
    `UPDATE tb_scheduled_broadcast SET status = 'Pending'
     WHERE status = 'Sending'
       AND TIMESTAMPDIFF(MINUTE, updated_at, NOW()) > ?`,
    [staleMinutes]
  );
  return result.affectedRows;
}

async function cancelSchedule(scheduleId) {
  const [result] = await pool.query(
    `UPDATE tb_scheduled_broadcast SET status = 'Cancelled'
     WHERE schedule_id = ? AND status = 'Pending'`,
    [scheduleId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createSchedule,
  findSchedules,
  findScheduleById,
  findDueSchedules,
  claimSchedule,
  markSent,
  markFailed,
  resetStaleSending,
  cancelSchedule,
};
