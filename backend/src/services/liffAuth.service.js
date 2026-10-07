function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

/**
 * ส่ง idToken ไปให้ LINE ตรวจสอบความถูกต้องและลายเซ็นดิจิทัล
 * เอกสาร: https://developers.line.biz/en/reference/line-login/#verify-id-token
 */
async function verifyLiffIdToken(idToken) {
  if (!idToken) {
    throwError('ไม่พบ LINE ID Token', 400);
  }

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

    // กรณี LINE Verify API ตอบกลับ error (เช่น ID Token หมดอายุ ลายเซ็นไม่ถูกต้อง หรือ client_id ไม่ตรงกัน)
    const errBody = await response.text();
    console.error('LINE Verify API Error (HTTP', response.status, '):', errBody);
    throwError('LINE ID Token ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาลองใหม่อีกครั้ง', 401);
  } catch (err) {
    if (err.statusCode) throw err;
    console.error('verifyLiffIdToken network exception:', err);
    throwError('ไม่สามารถตรวจสอบตัวตนกับ LINE ได้ กรุณาลองใหม่อีกครั้ง', 500);
  }
}

module.exports = { verifyLiffIdToken };