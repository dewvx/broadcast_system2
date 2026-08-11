const broadcastService = require('../services/broadcast.service');

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

async function getZones(req, res, next) {
  try {
    const zones = await broadcastService.getZones();
    res.json({ success: true, data: zones });
  } catch (err) {
    next(err);
  }
}

module.exports = { broadcast, getZones };