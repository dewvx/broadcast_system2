const villagerModel = require('../models/villager.model');
const { verifyLiffIdToken } = require('./liffAuth.service');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

/**
 * เช็คว่าลูกบ้านคนนี้เคยลงทะเบียนหรือยัง
 * - เคยแล้ว -> return ข้อมูลลูกบ้าน (isNewUser: false)
 * - ยังไม่เคย -> return แค่ line_user_id/displayName ให้ frontend ไปแสดงฟอร์มลงทะเบียนต่อ (isNewUser: true)
 */
async function checkOrLogin(idToken) {
  const { lineUserId, displayName } = await verifyLiffIdToken(idToken);

  const existing = await villagerModel.findByLineUserId(lineUserId);
  if (existing) {
    return { isNewUser: false, villager: existing };
  }

  return { isNewUser: true, lineUserId, displayName };
}

/**
 * สมัครลูกบ้านใหม่ - ต้อง verify idToken ซ้ำอีกรอบตรงนี้
 * (ห้ามเชื่อ lineUserId ที่ frontend ส่งมาตรงๆ แม้จะเพิ่งเช็คผ่าน checkOrLogin ไปแล้วก็ตาม
 *  เพราะ request นี้เป็นคนละ request กัน ต้องยืนยันใหม่เสมอ)
 */
async function registerVillager(idToken, { firstName, lastName, houseNumber, zoneName }) {
  const { lineUserId, displayName } = await verifyLiffIdToken(idToken);

  const existing = await villagerModel.findByLineUserId(lineUserId);
  if (existing) {
    throwError('LINE บัญชีนี้ลงทะเบียนไปแล้ว', 400);
  }

  if (!firstName || !lastName || !houseNumber) {
    throwError('กรุณากรอกชื่อ นามสกุล และบ้านเลขที่ให้ครบ', 400);
  }

  const villagerId = await villagerModel.create({
    lineUserId,
    displayName,
    firstName,
    lastName,
    houseNumber,
    zoneName,
  });

  return villagerModel.findById(villagerId);
}

module.exports = { checkOrLogin, registerVillager };