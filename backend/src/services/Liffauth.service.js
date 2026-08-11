function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

/**
 * ส่ง idToken ไปให้ LINE ตรวจสอบว่าจริงมั้ย
 * LINE จะตอบกลับมาพร้อมข้อมูลเจ้าของ token (sub = line_user_id, name = ชื่อโปรไฟล์)
 * เอกสาร: https://developers.line.biz/en/reference/line-login/#verify-id-token
 *
 * ใช้ร่วมกันทั้ง villager.service.js (ตอน register/login) และ news.service.js (ตอนดูรายละเอียดข่าว)
 * แยกไว้ตรงนี้ที่เดียว กันโค้ด verify ซ้ำกันหลายจุด
 */
async function verifyLiffIdToken(idToken) {
  const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: process.env.LIFF_CHANNEL_ID,
    }),
  });

  if (!response.ok) {
    throwError('LINE ID Token ไม่ถูกต้องหรือหมดอายุ', 401);
  }

  const data = await response.json();
  return { lineUserId: data.sub, displayName: data.name };
}

module.exports = { verifyLiffIdToken };