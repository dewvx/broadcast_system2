# System Audit — สรุปผลการตรวจสอบระบบ

> ตรวจเมื่อ: 2026-08-24
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
| 4 | ลบข่าวแล้วไม่ลบไฟล์รูปออกจาก disk (orphan uploads) | `backend/src/services/news.service.js:57 deleteNews()` | 🟡 Medium | ⬜ |
| 5 | Directory ขยะ `{api,pages/...}` ว่างๆ (brace-expansion พัง) | `frontend/src/` | 🟢 Cleanup | ⬜ |
| 6 | console.log debug ค้าง (LINE event dump JSON ทุก event) | `backend/src/controllers/webhook.controller.js:9`, `backend/src/services/liffAuth.service.js:49`, `scheduledBroadcast.service.js:95`, `jobs/broadcastScheduler.job.js:17,35` | 🟢 Cleanup | ⬜ |
| 7 | Stale TODO comment (routes ใส่ครบแล้ว) | `backend/server.js:30` | 🟢 Cleanup | ⬜ |
| 8 | FAQ "ทดสอบ" ใน `tb_chatbot_faq` เก็บ **full URL** ใน `answer_text` ทำให้ Flex Message แสดง base URL ค้างในเนื้อหา (cleanText ไม่ถูกตัด) | DB record: `answer_text = 'https://liff.line.me/.../news/13'` — ควรเก็บเป็น `/news/13` | 🟢 Data fix | ✅ **แก้แล้ว** |
| 9 | Scheduler ตั้งเวลาส่งข่าว: เก็บ naive local time ฝั่ง Node แต่เทียบ `NOW()` ฝั่ง MySQL — deploy server TZ ไม่ตรงจะส่งพลาดเวลา ~6 ชม. | `scheduledBroadcast.service.js:25,45`, `scheduledBroadcast.model.js:59` — รายละเอียดทั้งหมดดู `docs/SCHEDULED_BROADCAST_AUDIT.md` | 🟡 High (deploy) | ⬜ |

### ผลทดสอบหลังแก้ข้อ 1–2 (2026-08-24)

- `require('./src/services/chatbot.service')` + `liffAuth.service` → OK
- FAQ keyword match ("เวลาเปิดทำการ") → ตอบถูกต้อง ✓
- Deep link `/news/13` → สร้าง Flex Message + button URI จาก env `LIFF_ID` ถูกต้อง ✓
- กรณี `LIFF_ID` ไม่มีค่า → throw `{ statusCode: 500, message: 'ยังไม่ได้ตั้งค่า LIFF_ID...' }` ✓

## ℹ️ หมายเหตุด้าน Security (by design — แต่ควรยืนยัน)

- `GET /api/category`, `GET /api/category/:id` ไม่มี authMiddleware (`category.routes.js:9-11`) — comment ระบุ intentional สำหรับ LIFF
- News public endpoints (`/public/list`, `/public/:id`, `/:id/view`) ไม่มี auth (idToken optional/guest) — by design
- `user.model.js:72` มี string concat ใน UPDATE แต่ fields เป็น hardcoded column names + values parameterized → ปลอดภัย

## ลำดับความสำคัญที่แนะนำ

1. ~~แก้ข้อ 1–2 ก่อน (security / deploy blocker)~~ → ✅ **แก้แล้ว + ทดสอบผ่าน (ดูผลด้านบน)**
2. ~~แก้ข้อ 3 (เติม `.env.example` ให้ครบ)~~ → ✅ **แก้แล้ว**
3. Cleanup ข้อ 5–7 + Data fix ข้อ 8 → ✅ **ข้อ 8 แก้แล้ว**
4. แก้ข้อ 9 (timezone scheduler) ก่อน deploy production — ดู `docs/SCHEDULED_BROADCAST_AUDIT.md`
