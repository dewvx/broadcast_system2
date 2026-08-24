const broadcastService = require('../services/broadcast.service');
const scheduledBroadcastService = require('../services/scheduledBroadcast.service');

async function broadcast(req, res, next) {
  try {
    // zoneName ไม่บังคับ - ถ้าไม่ส่งมา = ส่งหาลูกบ้านทั้งหมด
    const { zoneName } = req.body;

    const result = await broadcastService.broadcastNews(req.params.newsId, zoneName, req.user);
    res.json({
      success: true,
      message: `ส่งข่าวสำเร็จ ถึงลูกบ้าน ${result.totalReceived} คน (${result.zoneName})`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function scheduleBroadcast(req, res, next) {
  try {
    const { zoneName, scheduledAt } = req.body;
    const result = await scheduledBroadcastService.scheduleNews(req.params.newsId, { zoneName, scheduledAt }, req.user);

    const when = new Date(result.scheduledAt).toLocaleString('th-TH');
    res.json({
      success: true,
      message: `ตั้งเวลาส่งข่าวสำเร็จ จะส่งให้ลูกบ้าน (${result.zoneName}) ในวันที่ ${when}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getScheduledList(req, res, next) {
  try {
    // query ?status=Pending เอาเฉพาะรายการรอส่ง / ไม่ส่ง = ทุกสถานะ (ประวัติ)
    const schedules = await scheduledBroadcastService.getSchedules(req.query.status);
    res.json({ success: true, data: schedules });
  } catch (err) {
    next(err);
  }
}

async function cancelScheduled(req, res, next) {
  try {
    const result = await scheduledBroadcastService.cancelSchedule(req.params.scheduleId, req.user);
    res.json({ success: true, message: 'ยกเลิกตารางส่งข่าวเรียบร้อยแล้ว', data: result });
  } catch (err) {
    next(err);
  }
}

async function getZones(req, res, next) {
  try {
    const zones = await broadcastService.getZones();
    res.json({ success: true, data: zones });
  } catch (err) {
    next(err);
  }
}

module.exports = { broadcast, getZones, scheduleBroadcast, getScheduledList, cancelScheduled };