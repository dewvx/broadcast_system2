# System Audit — สรุปผลการตรวจสอบระบบ

> ตรวจเมื่อ: 2026-08-24 | อัพเดตล่าสุด: 2026-08-25
> ขอบเขต: เช็คความครบถ้วนของฟีเจอร์ตาม `docs/FEATURES.md` + ตรวจโค้ดจริง (backend/frontend)

## สรุปภาพรวม

ฟีเจอร์หลักตาม `docs/FEATURES.md` **ทำครบทั้งหมด 3.1–3.12** ✅

รวมถึงข้อที่ FEATURES.md เคยระบุไว้ว่า "ต้องเช็ค UI" — ยืนยันแล้วว่ามีจริง:
- ปุ่มลบข่าว: `frontend/src/pages/admin/NewsManagementPage.jsx:104,313` (มี `window.confirm`)
- ช่องอัปโหลดรูป: `frontend/src/pages/admin/NewsFormPage.jsx` (`<input type="file">` + FormData → `POST /api/news/:id/image`)

## ✅ สิ่งที่เรียบร้อยแล้ว

- Delete news ครบ E2E: route (`news.routes.js:34`, Admin only) → controller → service → model (parameterized) → UI
- Image upload: multer (`upload.middleware.js`, jpeg/png/webp, limit 5MB) + serve static `/uploads` (`server.js:23`)
- `/webhook` mount **ก่อน** `express.json()` ใน `backend/server.js` ✓
- Mount routes ครบทั้ง 10 files — ไม่มี route ไหนถูกลืม
- Frontend routes ↔ pages ตรงกันหมด (21 pages, `router/index.jsx`) — ไม่มี import ชี้ไฟล์ที่ไม่มี
- SQL parameterized (`?` placeholders) ทุก model — ปลอดภัยจาก SQL Injection
- Auth + Role middleware ครบในทุก endpoint ฝั่ง admin

## ⚠️ สิ่งที่ต้องแก้

| # | ปัญหา | ตำแหน่ง | ความรุนแรง | สถานะ |
|---|---|---|---|---|
| 1 | Hardcode LIFF ID เป็น fallback ใน code | `backend/src/services/chatbot.service.js` | 🔴 Security | ✅ **แก้แล้ว** — throw error ถ้าไม่มี `LIFF_ID` (pattern เดียวกับ `PUBLIC_APP_URL`) |
| 2 | require case ไม่ตรงชื่อไฟล์ (`liffAuth.service` vs `Liffauth.service.js`) — Windows ผ่าน แต่ deploy Linux จะ crash | `backend/src/middlewares/liffAuth.middleware.js:1` | 🔴 Deploy blocker | ✅ **แก้แล้ว** — rename ไฟล์เป็น `liffAuth.service.js` (git mv) |
| 3 | `.env.example` ขาด env vars ที่ code เรียกใช้: `PUBLIC_APP_URL`, `LIFF_ID` | `broadcast.service.js:21,83`, `chatbot.service.js:71` | 🟡 High | ✅ **แก้แล้ว** — เติม `LIFF_ID` + `PUBLIC_APP_URL` ใน `backend/.env.example` แล้ว (2026-08-24) |
| 4 | ลบข่าวแล้วไม่ลบไฟล์รูปออกจาก disk (orphan uploads) | `backend/src/services/news.service.js:57 deleteNews()` | 🟡 Medium | ✅ **แก้แล้ว** (2026-08-25) — `deleteUploadedImage()` ลบไฟล์หลัง delete + ลบไฟล์เก่าตอน `setNewsImage` replace (basename กัน path traversal, ENOENT ข้าม) |
| 5 | Directory ขยะ `{api,pages/...}` ว่างๆ (brace-expansion พัง) | `frontend/src/` | 🟢 Cleanup | ✅ **แก้แล้ว** (2026-08-25) — ลบแล้ว, `vite build` ผ่าน |
| 6 | console.log debug ค้าง (LINE event dump JSON ทุก event) | `backend/src/controllers/webhook.controller.js:9`, `backend/src/services/liffAuth.service.js:49`, `scheduledBroadcast.service.js:95`, `jobs/broadcastScheduler.job.js:17,35` | 🟢 Cleanup | ✅ **แก้แล้ว** (2026-08-25) — ลบ event dump ใน webhook + downgrade fallback log เป็น warn; `[scheduler]` logs **เก็บไว้** เพราะเป็น operation log ที่ print เฉพาะเมื่อมีงาน/error ไม่ใช่ debug spam |
| 7 | Stale TODO comment (routes ใส่ครบแล้ว) | `backend/server.js:30` | 🟢 Cleanup | ✅ **แก้แล้ว** (2026-08-25) |
| 8 | FAQ "ทดสอบ" ใน `tb_chatbot_faq` เก็บ **full URL** ใน `answer_text` ทำให้ Flex Message แสดง base URL ค้างในเนื้อหา (cleanText ไม่ถูกตัด) | DB record: `answer_text = 'https://liff.line.me/.../news/13'` — ควรเก็บเป็น `/news/13` | 🟢 Data fix | ✅ **แก้แล้ว** |
| 9 | Scheduler ตั้งเวลาส่งข่าว: เก็บ naive local time ฝั่ง Node แต่เทียบ `NOW()` ฝั่ง MySQL — deploy server TZ ไม่ตรงจะส่งพลาดเวลา ~6 ชม. | `scheduledBroadcast.service.js:25,45`, `scheduledBroadcast.model.js:59` — รายละเอียดทั้งหมดดู `docs/SCHEDULED_BROADCAST_AUDIT.md` | 🟡 High (deploy) | ✅ **แก้แล้ว** (2026-08-25 — รายละเอียดด้านล่าง) |

### ผลทดสอบหลังแก้ข้อ 1–2 (2026-08-24)

- `require('./src/services/chatbot.service')` + `liffAuth.service` → OK
- FAQ keyword match ("เวลาเปิดทำการ") → ตอบถูกต้อง ✓
- Deep link `/news/13` → สร้าง Flex Message + button URI จาก env `LIFF_ID` ถูกต้อง ✓
- กรณี `LIFF_ID` ไม่มีค่า → throw `{ statusCode: 500, message: 'ยังไม่ได้ตั้งค่า LIFF_ID...' }` ✓

### ผลทดสอบหลังแก้ข้อ 9 — timezone scheduler (2026-08-25)

ยืนยันจากการทดสอบจริงว่า MySQL session tz = `SYSTEM` (+7) ขณะที่ค่าที่เก็บเป็น UTC → query เดิมใช้ `NOW()` คลาดกัน 7 ชม. ตรงตามที่ audit ระบุ

**สิ่งที่แก้:**
- `scheduledBroadcast.service.js`:
  - `thaiInputToUtc()` — ตีความ `"YYYY-MM-DDTHH:mm"` จาก datetime-local เป็นเวลาไทย +07:00 ตายตัว (`Date.UTC` หัก offset 7 ชม. ตรงๆ) → ผลลัพธ์เหมือนกันไม่ว่า server TZ ไหน + validate วันที่ตามปฏิทิน (กัน 02-30)
  - `formatUtcForMySql()` — insert เป็นสตริง UTC `"YYYY-MM-DD HH:mm:ss"` (ไม่มี "T" ให้ MySQL เก่าติด)
  - `utcMysqlToThaiIso()` — response/`GET /scheduled` แปลงกลับเป็น ISO เวลาไทย `...+07:00` (frontend `toLocaleString('th-TH')` โชว์ถูกต้อง)
  - เช็ค "อนาคต" ด้วย epoch (`Date.now()`) ไม่ขึ้นกับ TZ
- `scheduledBroadcast.model.js`:
  - `findDueSchedules`: `NOW()` → **`UTC_TIMESTAMP()`** (จุด bug หลัก)
  - `findSchedules`: `DATE_FORMAT(scheduled_at, ...)` คืนสตริงดิบ UTC ไม่ให้ mysql2 ตีความตาม TZ เครื่อง

**ผลทดสอบ (ผ่านทั้งหมด):**
- Conversion tests ผ่านกับ machine TZ = UTC / America/New_York / Asia/Bangkok / Asia/Tokyo
- DB round-trip: กรอก `2026-08-25T14:27` (ไทย, +5 นาที) → MySQL เก็บ `2026-08-25 07:27:00` (UTC, ต่าง 7 ชม.) ✓
- `findDueSchedules` ยังไม่หยิบงานก่อนถึงเวลา ✓
- อ่านกลับได้ `2026-08-25T14:27:00+07:00` ✓ (แถวทดสอบ set Cancelled แล้ว ไม่มี broadcast จริง)

> ✅ E2E ผ่านแล้ว (2026-08-25): schedule #4 ตั้งเวลา 15:08 ไทย → scheduler ส่งจริงตรงเวลา ถึงลูกบ้าน 1 คน

### Security hardening — password reset / OTP (2026-08-25)

ตรวจ `auth.service.js`, `passwordReset.model.js`, `auth.routes.js`, `auth.controller.js` พบ 4 จุด **แก้ครบทั้งหมดแล้ว**:

| # | ปัญหา | สถานะ |
|---|---|---|
| 1 | `/forgot-password` + `/reset-password` ไม่มี rate limit → สแปม LINE push / brute force OTP | ✅ **แก้แล้ว** — เพิ่ม `express-rate-limit` (`middlewares/rateLimit.middleware.js`) 5 req/15 นาที/IP |
| 2 | ลอง OTP ผิดไม่จำกัด (brute force 10⁶ ใน window 10 นาที) | ✅ **แก้แล้ว** — column `attempts_count` (ALTER แล้ว + schema.sql/DATABASE.md) ผิดครบ 5 ครั้ง token invalid ทันที (`passwordReset.model.js registerFailedAttempt()`) |
| 3 | OTP ใช้ `Math.random()` (predictable) | ✅ **แก้แล้ว** — `crypto.randomInt(100000, 1000000)` (`auth.service.js`) |
| 4 | Response ต่างกัน 3 กรณี (404/400/200) → user enumeration + resetToken คืนผ่าน body | ✅ **แก้แล้ว** — flow ใหม่: `/forgot-password` ตอบ generic message เดียวกันทุกกรณี (case จริง log server เท่านั้น), `/reset-password` ใช้ `{username, otp, newPassword}` ไม่ส่ง token ผ่าน body, เพิ่ม resend cooldown 60 วินาที (429) |

**API contract change:** `POST /api/auth/reset-password` เปลี่ยนจาก `{resetToken, otp, newPassword}` → `{username, otp, newPassword}` (frontend `ForgotPasswordPage.jsx` + `auth.api.js` อัพเดตแล้ว)

**ผลทดสอบ:** OTP ผิด 4 ครั้งยังใช้ได้ ✓ / ครบ 5 invalid ทันที ✓ / OTP ถูกหลังล็อคก็ reject + password ไม่ถูกแตะ ✓ / success path bcrypt + one-time use + ขอ OTP ใหม่ mark ตัวเก่า used ✓ (ทดสอบด้วย user ชั่วคราว ลบทิ้งแล้ว)

**ผลทดสอบ anti-enumeration flow:** ghost username → generic message ไม่มี record ✓ / ไม่ผูก LINE → generic เหมือนกัน ✓ / cooldown ขอซ้ำ <60 วิ → 429 ✓ / username+OTP flow lock 5 ครั้ง ✓ / OTP ไม่ถูกใช้ข้าม username ✓ / frontend `vite build` ผ่าน ✓

## ℹ️ หมายเหตุด้าน Security (by design — แต่ควรยืนยัน)

- `GET /api/category`, `GET /api/category/:id` ไม่มี authMiddleware (`category.routes.js:9-11`) — comment ระบุ intentional สำหรับ LIFF
- News public endpoints (`/public/list`, `/public/:id`, `/:id/view`) ไม่มี auth (idToken optional/guest) — by design
- `user.model.js:72` มี string concat ใน UPDATE แต่ fields เป็น hardcoded column names + values parameterized → ปลอดภัย

## ลำดับความสำคัญที่แนะนำ

1. ~~แก้ข้อ 1–2 ก่อน (security / deploy blocker)~~ → ✅ **แก้แล้ว + ทดสอบผ่าน (ดูผลด้านบน)**
2. ~~แก้ข้อ 3 (เติม `.env.example` ให้ครบ)~~ → ✅ **แก้แล้ว**
3. ~~Security hardening password reset / OTP (rate limit, OTP attempt limit, CSPRNG, anti-enumeration)~~ → ✅ **แก้ครบ 4 จุด + ทดสอบผ่าน (2026-08-25 — ดูหัวข้อด้านบน)**
4. ~~แก้ข้อ 9 (timezone scheduler) ก่อน deploy production~~ → ✅ **แก้แล้ว + ทดสอบผ่าน (2026-08-25)** — เหลือ E2E ยิง broadcast จริงตรงเวลาอีกรอบเท่านั้น
5. ~~Cleanup ที่เหลือ: ข้อ 4 (orphan uploads), 5–7~~ → ✅ **แก้ครบ + ทดสอบผ่าน (2026-08-25)**
   - orphan fix E2E: `setNewsImage` replace ลบไฟล์เก่า ✓ / `deleteNews` ลบ record + ไฟล์ ✓
   - ข้อสังเกตเพิ่มเติม: `document.service.js:42` มี orphan pattern เดียวกัน (ลบ record แต่ไฟล์ document ค้างบน disk) — ยังไม่แก้ ควรทำ pattern เดียวกับ `deleteUploadedImage()` ถ้ามีเวลา

> 🎯 สถานะปัจจุบัน: **ข้อ 1–9 แก้ครบทั้งหมด + E2E ผ่าน** — scheduled broadcast #4 ส่งข่าวสำเร็จจริงตรงเวลา 15:08 เวลาไทย (2026-08-25) ถึงลูกบ้าน 1 คน → timezone fix ยืนยันครบทั้ง chain: conversion → storage UTC → due query → ส่งจริง
