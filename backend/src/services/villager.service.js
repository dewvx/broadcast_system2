const villagerModel = require('../models/villager.model');
const zoneModel = require('../models/zone.model');
const { verifyLiffIdToken } = require('./liffAuth.service');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

async function validateZone(zoneName, required = true) {
  if (!zoneName || !zoneName.trim()) {
    if (required) {
      throwError('กรุณาเลือกซอย/คุ้มที่อยู่อาศัย', 400);
    }
    return null;
  }
  const trimmed = zoneName.trim();
  const zone = await zoneModel.findByName(trimmed);
  if (!zone) {
    throwError('ซอย/คุ้มที่เลือกไม่ถูกต้อง', 400);
  }
  return trimmed;
}

/**
 * เช็คว่าลูกบ้านคนนี้เคยลงทะเบียนหรือยัง
 */
async function checkOrLogin(idToken) {
  const { lineUserId, displayName } = await verifyLiffIdToken(idToken);

  const existing = await villagerModel.findByLineUserId(lineUserId);
  if (existing) {
    // หากเคยลงทะเบียนไว้และ re-follow กลับมา ให้ปรับสถานะเป็น active = 1
    if (!existing.is_active) {
      await villagerModel.setIsActiveByLineUserId(lineUserId, 1);
      existing.is_active = 1;
    }
    return { isNewUser: false, villager: existing };
  }

  return { isNewUser: true, lineUserId, displayName };
}

/**
 * สมัครลูกบ้านใหม่
 * - ต้อง verify idToken ซ้ำอีกรอบตรงนี้ (ห้ามเชื่อ lineUserId ที่ frontend ส่งมาตรงๆ)
 * - ต้องได้รับ pdpaConsent === true ก่อนถึงจะบันทึกได้ (Server-side enforce)
 */
async function registerVillager(idToken, { firstName, lastName, houseNumber, zoneName, pdpaConsent }) {
  // Validate PDPA consent — enforce ฝั่ง server เสมอ ไม่เชื่อ frontend ฝ่ายเดียว
  if (pdpaConsent !== true) {
    throwError('กรุณายินยอมให้เก็บข้อมูลส่วนบุคคลก่อนลงทะเบียน', 400);
  }

  const { lineUserId, displayName } = await verifyLiffIdToken(idToken);

  const existing = await villagerModel.findByLineUserId(lineUserId);
  if (existing) {
    throwError('LINE บัญชีนี้ลงทะเบียนไปแล้ว', 400);
  }

  if (!firstName || !lastName || !houseNumber) {
    throwError('กรุณากรอกชื่อ นามสกุล และบ้านเลขที่ให้ครบ', 400);
  }

  const validZone = await validateZone(zoneName);

  const villagerId = await villagerModel.create({
    lineUserId,
    displayName,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    houseNumber: houseNumber.trim(),
    zoneName: validZone,
    pdpaConsentAt: new Date(), // บันทึก server-side timestamp เพื่อกันปลอม
  });

  return villagerModel.findById(villagerId);
}

/**
 * ดึงรายชื่อลูกบ้านทั้งหมด (Admin เท่านั้น)
 */
async function getAllVillagers() {
  return villagerModel.findAll();
}

/**
 * ลูกบ้านแก้ไขโปรไฟล์ตนเองผ่าน LIFF
 */
async function updateSelfProfile(idToken, { firstName, lastName, houseNumber, zoneName }) {
  const { lineUserId } = await verifyLiffIdToken(idToken);

  const existing = await villagerModel.findByLineUserId(lineUserId);
  if (!existing) {
    throwError('ไม่พบข้อมูลลูกบ้านนี้ในระบบ กรุณาลงทะเบียนก่อน', 404);
  }

  if (!firstName || !lastName || !houseNumber) {
    throwError('กรุณากรอกชื่อ นามสกุล และบ้านเลขที่ให้ครบ', 400);
  }

  const validZone = await validateZone(zoneName);

  await villagerModel.updateByLineUserId(lineUserId, {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    houseNumber: houseNumber.trim(),
    zoneName: validZone,
  });

  return villagerModel.findByLineUserId(lineUserId);
}

/**
 * Admin แก้ไขข้อมูลลูกบ้านแทนให้
 */
async function updateVillagerByAdmin(villagerId, { firstName, lastName, houseNumber, zoneName, isActive }) {
  const existing = await villagerModel.findById(villagerId);
  if (!existing) {
    throwError('ไม่พบลูกบ้านคนนี้ในระบบ', 404);
  }

  if (!firstName || !lastName || !houseNumber) {
    throwError('กรุณากรอกชื่อ นามสกุล และบ้านเลขที่ให้ครบ', 400);
  }

  const validZone = await validateZone(zoneName);

  await villagerModel.updateByAdmin(villagerId, {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    houseNumber: houseNumber.trim(),
    zoneName: validZone,
    isActive: isActive !== undefined ? Number(isActive) : existing.is_active,
  });

  return villagerModel.findById(villagerId);
}

/**
 * Admin ลบลูกบ้านออกจากระบบ
 */
async function deleteVillagerByAdmin(villagerId) {
  const existing = await villagerModel.findById(villagerId);
  if (!existing) {
    throwError('ไม่พบลูกบ้านคนนี้ในระบบ', 404);
  }

  await villagerModel.remove(villagerId);
}

/**
 * เปลี่ยนสถานะการติดตาม (is_active) เมื่อเกิด Event follow/unfollow จาก LINE Webhook
 */
async function setVillagerActiveStatus(lineUserId, isActive) {
  await villagerModel.setIsActiveByLineUserId(lineUserId, isActive);
}

module.exports = {
  checkOrLogin,
  registerVillager,
  getAllVillagers,
  updateSelfProfile,
  updateVillagerByAdmin,
  deleteVillagerByAdmin,
  setVillagerActiveStatus,
};