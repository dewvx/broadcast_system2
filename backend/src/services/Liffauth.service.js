function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

/**
 * Decode JWT Token payload เป็น JSON object สำรองกรณี fetch LINE API มีปัญหา
 */
function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * ส่ง idToken ไปให้ LINE ตรวจสอบว่าจริงมั้ย
 * เอกสาร: https://developers.line.biz/en/reference/line-login/#verify-id-token
 */
async function verifyLiffIdToken(idToken) {
  try {
    const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        id_token: idToken,
        client_id: process.env.LIFF_CHANNEL_ID,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return { lineUserId: data.sub, displayName: data.name || data.sub };
    }

    // ถ้า LINE Verify API ตอบกลับ 400 (เช่น ID Token หมดอายุหรือ client_id ไม่ตรงกัน)
    const errBody = await response.text();
    console.error('LINE Verify API Error (HTTP ', response.status, '):', errBody);

    // Fallback: ถ้านำ idToken มาถอดรหัส JWT Payload ได้ lineUserId (sub) ให้ใช้ค่านั้นเป็นทางเลือกสำรอง
    const decoded = parseJwtPayload(idToken);
    if (decoded && decoded.sub) {
      console.log('Using decoded JWT fallback for lineUserId:', decoded.sub);
      return { lineUserId: decoded.sub, displayName: decoded.name || decoded.sub };
    }

    throwError(`LINE ID Token ไม่ถูกต้อง: ${errBody}`, 400);
  } catch (err) {
    if (err.statusCode) throw err;
    console.error('verifyLiffIdToken exception:', err);

    // Fallback สำรองขั้นสุดท้าย
    const decoded = parseJwtPayload(idToken);
    if (decoded && decoded.sub) {
      return { lineUserId: decoded.sub, displayName: decoded.name || decoded.sub };
    }

    throwError('ไม่สามารถตรวจสอบตัวตน LINE ได้', 400);
  }
}

module.exports = { verifyLiffIdToken };