const zoneService = require('../services/zone.service');

async function getAll(req, res, next) {
  try {
    const zones = await zoneService.getAllZones();
    res.json({ success: true, data: zones });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const zone = await zoneService.getZoneById(req.params.id);
    res.json({ success: true, data: zone });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const zone = await zoneService.createZone(req.body.zoneName);
    res.status(201).json({ success: true, data: zone, message: 'เพิ่มซอย/คุ้มสำเร็จ' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const zone = await zoneService.updateZone(req.params.id, req.body.zoneName);
    res.json({ success: true, data: zone, message: 'แก้ไขซอย/คุ้มสำเร็จ' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await zoneService.deleteZone(req.params.id);
    res.json({ success: true, message: 'ลบซอย/คุ้มสำเร็จ' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
};
