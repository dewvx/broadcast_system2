const zoneModel = require('../models/zone.model');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

async function getAllZones() {
  return zoneModel.findAll();
}

async function getZoneById(zoneId) {
  const zone = await zoneModel.findById(zoneId);
  if (!zone) throwError('ไม่พบซอย/คุ้มนี้ในระบบ', 404);
  return zone;
}

async function createZone(zoneName) {
  if (!zoneName || !zoneName.trim()) {
    throwError('กรุณากรอกชื่อซอย/คุ้ม', 400);
  }

  const trimmed = zoneName.trim();
  const existing = await zoneModel.findByName(trimmed);
  if (existing) {
    throwError('มีชื่อซอย/คุ้มนี้อยู่ในระบบแล้ว', 400);
  }

  const zoneId = await zoneModel.create(trimmed);
  return zoneModel.findById(zoneId);
}

async function updateZone(zoneId, zoneName) {
  const zone = await zoneModel.findById(zoneId);
  if (!zone) throwError('ไม่พบซอย/คุ้มนี้ในระบบ', 404);

  if (!zoneName || !zoneName.trim()) {
    throwError('กรุณากรอกชื่อซอย/คุ้ม', 400);
  }

  const trimmed = zoneName.trim();
  const existing = await zoneModel.findByName(trimmed);
  if (existing && existing.zone_id !== Number(zoneId)) {
    throwError('มีชื่อซอย/คุ้มนี้อยู่ในระบบแล้ว', 400);
  }

  await zoneModel.update(zoneId, trimmed);
  return zoneModel.findById(zoneId);
}

async function deleteZone(zoneId) {
  const zone = await zoneModel.findById(zoneId);
  if (!zone) throwError('ไม่พบซอย/คุ้มนี้ในระบบ', 404);

  const villagerCount = await zoneModel.countVillagersUsingZone(zone.zone_name);
  if (villagerCount > 0) {
    throwError(`ไม่สามารถลบได้ เนื่องจากมีลูกบ้าน ${villagerCount} คน อยู่ในซอย/คุ้มนี้`, 400);
  }

  await zoneModel.remove(zoneId);
}

module.exports = {
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
};
