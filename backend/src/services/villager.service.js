const crypto = require('crypto');
const villagerModel = require('../models/villager.model');
const zoneModel = require('../models/zone.model');
const villagerOtpModel = require('../models/villagerOtp.model');
const { lineClient } = require('../config/line');
const { verifyLiffIdToken } = require('./liffAuth.service');

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_EXPIRATION_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

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
 * ส่งรหัส OTP 6 หลักเข้า LINE สำหรับยืนยันการลงทะเบียนลูกบ้าน
 */
async function sendRegistrationOtp(idToken) {
  if (!idToken) {
    throwError('ไม่พบ idToken', 400);
  }

  const { lineUserId, displayName } = await verifyLiffIdToken(idToken);

  const existing = await villagerModel.findByLineUserId(lineUserId);
  if (existing) {
    throwError('LINE บัญชีนี้ลงทะเบียนไปแล้ว', 400);
  }

  // Cooldown 60 วินาที/ครั้ง กันขอ OTP รัว
  if (await villagerOtpModel.hasRecentOtp(lineUserId, RESEND_COOLDOWN_SECONDS)) {
    throwError('คุณเพิ่งขอรหัส OTP ไปเมื่อสักครู่ กรุณารอประมาณ 1 นาทีแล้วลองใหม่อีกครั้ง', 429);
  }

  // สร้าง OTP 6 หลัก (CSPRNG)
  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  await villagerOtpModel.create({
    lineUserId,
    otpCode,
    expiresAt,
  });

  // ส่ง OTP เข้า LINE ของผู้ใช้โดยตรง
  try {
    await lineClient.pushMessage({
      to: lineUserId,
      messages: [
        {
          type: 'text',
          text: `🔐 [ระบบหอกระจายข่าวชุมชน]\nรหัสยืนยันการลงทะเบียนของคุณคือ:\n\n👉 ${otpCode} 👈\n\n(รหัสมีอายุการใช้งาน ${OTP_EXPIRATION_MINUTES} นาที)\nหากท่านไม่ได้ทำรายการ โปรดละเว้นข้อความนี้`,
        },
      ],
    });
  } catch (err) {
    console.error('Failed to send registration OTP push message:', err);
    throwError('ไม่สามารถส่งข้อความ OTP ไปยัง LINE ได้ กรุณาตรวจสอบว่าท่านได้เพิ่มเพื่อน LINE OA หรือยัง', 500);
  }

  return { message: 'ส่งรหัส OTP 6 หลักไปยัง LINE ของคุณเรียบร้อยแล้ว' };
}

/**
 * สมัครลูกบ้านใหม่
 * - ต้อง verify idToken ซ้ำอีกรอบตรงนี้ (ห้ามเชื่อ lineUserId ที่ frontend ส่งมาตรงๆ)
 * - ต้องได้รับ pdpaConsent === true ก่อนถึงจะบันทึกได้ (Server-side enforce)
 * - ต้องยืนยันรหัส OTP 6 หลักผ่าน LINE ก่อนบันทึกลง tb_villager
 */
async function registerVillager(idToken, { firstName, lastName, houseNumber, zoneName, pdpaConsent, otpCode }) {
  // Validate PDPA consent — enforce ฝั่ง server เสมอ ไม่เชื่อ frontend ฝ่ายเดียว
  if (pdpaConsent !== true) {
    throwError('กรุณายินยอมให้เก็บข้อมูลส่วนบุคคลก่อนลงทะเบียน', 400);
  }

  if (!otpCode || !otpCode.trim()) {
    throwError('กรุณากรอกรหัส OTP 6 หลัก', 400);
  }

  const { lineUserId, displayName } = await verifyLiffIdToken(idToken);

  const existing = await villagerModel.findByLineUserId(lineUserId);
  if (existing) {
    throwError('LINE บัญชีนี้ลงทะเบียนไปแล้ว', 400);
  }

  // ตรวจสอบ OTP
  const otpRecord = await villagerOtpModel.findActiveByLineUserId(lineUserId);
  if (!otpRecord) {
    throwError('รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว กรุณากดขอรหัสใหม่อีกครั้ง', 400);
  }

  if (otpRecord.otp_code !== otpCode.trim()) {
    await villagerOtpModel.registerFailedAttempt(otpRecord.otp_id, MAX_OTP_ATTEMPTS);
    const remaining = MAX_OTP_ATTEMPTS - (otpRecord.attempts_count + 1);
    if (remaining <= 0) {
      throwError('รหัส OTP ไม่ถูกต้องเกินจำนวนครั้งที่กำหนด กรุณากดขอรหัส OTP ใหม่อีกครั้ง', 400);
    }
    throwError(`รหัส OTP ไม่ถูกต้อง (เหลือโอกาสอีก ${remaining} ครั้ง)`, 400);
  }

  // ทำเครื่องหมายว่า OTP ถูกใช้งานแล้ว
  await villagerOtpModel.markAsUsed(otpRecord.otp_id);

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
  sendRegistrationOtp,
  registerVillager,
  getAllVillagers,
  updateSelfProfile,
  updateVillagerByAdmin,
  deleteVillagerByAdmin,
  setVillagerActiveStatus,
};