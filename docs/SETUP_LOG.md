# Setup Log — ระบบหอกระจายข่าวในชุมชนด้วย LINE OA

บันทึกขั้นตอนทั้งหมดที่ทำมาตั้งแต่เริ่มโปรเจกต์ เรียงตามลำดับเวลา ใช้เป็น reference เวลากลับมาดูว่าทำอะไรไปแล้วบ้าง

---

## Phase 1: วิเคราะห์ระบบ

1. อัปโหลดเอกสารสเปกระบบ (Use Case Diagram, Activity Diagram, Sequence Diagram, Class Diagram, Data Dictionary 10 ตาราง)
2. สรุประบบ: Web App จัดการข่าว/กิจกรรม/เอกสารราชการ + กระจายข่าวผ่าน LINE OA
   - 3 role: ผู้ใหญ่บ้าน (Admin), ผู้นำชุมชน/อสม. (Leader), ลูกบ้าน (Villager)
   - Tech stack: Node.js + Express (backend), MySQL (DB), Vite + React (frontend)
3. วางแผนไฟล์เอกสารที่ต้องมีให้ AI เข้าใจโปรเจกต์ไม่หลง: `CLAUDE.md`, `docs/DATABASE.md`, `docs/FEATURES.md`, `docs/ROLES.md`, `docs/LINE_INTEGRATION.md`

## Phase 2: ออกแบบโครงสร้างโปรเจกต์

4. ออกแบบ folder structure แยก `backend/` (MVC-lite: routes → controllers → models → services) กับ `frontend/` (Vite React แยก `pages/admin` กับ `pages/liff`)
5. สร้างไฟล์จริงทั้งหมด:
   - `backend/package.json`, `.env.example`, `server.js`
   - `backend/src/config/db.js` (MySQL pool), `src/config/line.js` (LINE SDK client)
   - `backend/src/routes/webhook.routes.js` + `controllers/webhook.controller.js` (รับ event จาก LINE, มี signature verification)
   - `backend/src/middlewares/errorHandler.js`
   - `backend/database/schema.sql` (10 ตารางตาม Data Dictionary), `seed.sql`
   - `frontend/package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `.env.example`
   - `docs/DATABASE.md`, `docs/FEATURES.md`, `docs/ROLES.md`, `docs/LINE_INTEGRATION.md`
   - `CLAUDE.md`, `README.md`, `.gitignore`

## Phase 3: ตั้งค่า LINE Developers Console

6. สมัคร LINE Official Account ผ่าน LINE Official Account Manager (manager.line.biz)
7. เปิดใช้งาน Messaging API ให้ OA (Settings → Messaging API → Enable) → สร้าง Provider ชื่อ "Admin"
8. เข้า developers.line.biz/console → เข้า Messaging API Channel (`broadcast_System`)
   - จด **Channel Secret** (แท็บ Basic settings)
   - Issue + จด **Channel Access Token (long-lived)** (แท็บ Messaging API)
9. สร้าง LIFF Channel (LINE Login) — **ผิดพลาดครั้งแรก:** สร้างไว้คนละ Provider ทำให้หา OA ในช่อง "Add friend option" ไม่เจอ
10. แก้ไข: ลบ LIFF channel เดิม สร้างใหม่ใน Provider เดียวกับ Messaging API channel (`Admin`)
11. เพิ่ม LIFF app ในนั้น: Size = Full, Endpoint URL ชั่วคราว, Scope = `profile`, Bot link = On (Aggressive)
12. Link LIFF channel เข้ากับ Messaging API channel สำเร็จ ได้ **LIFF ID**

## Phase 4: รันโปรเจกต์จริงครั้งแรก

13. `cd backend && npm install`
14. `copy .env.example .env` แล้วกรอกค่า `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`, DB credentials
15. เจอ error `no channel secret` ครั้งแรก — สาเหตุคือยังไม่ได้สร้างไฟล์ `.env` จริง (มีแค่ `.env.example`) หรือรันคำสั่งผิด directory
16. แก้ไขแล้ว รัน `npm run dev` สำเร็จ → `{"message":"Village News API is running"}`

## Phase 5: ติดตั้ง ngrok เพื่อทดสอบ Webhook

17. รัน `ngrok http 3000` ครั้งแรก → error `'ngrok' is not recognized` (ยังไม่ได้ติดตั้ง/ไม่อยู่ใน PATH)
18. ติดตั้งผ่าน npm: `npm install -g ngrok`
19. รันอีกครั้ง → error `ERR_NGROK_121` (เวอร์ชัน agent เก่าเกินไป ต่ำกว่า minimum ที่ account กำหนด)
20. แก้ไขด้วย `ngrok update` → อัปเดตสำเร็จเป็นเวอร์ชัน 3.39.10, session online, account เชื่อมต่อแล้ว (Plan: Free, Region: Asia Pacific)

---

## สถานะปัจจุบัน (ล่าสุด)

- [x] วิเคราะห์ระบบ + วางโครงสร้างเอกสาร
- [x] ออกแบบและสร้างโครง backend + frontend ครบ
- [x] Messaging API Channel + LIFF Channel พร้อมใช้งาน (link กันแล้ว)
- [x] Backend รันได้สำเร็จ เชื่อม `.env` ถูกต้อง
- [x] ngrok ติดตั้งและอัปเดตเวอร์ชันเรียบร้อย
- [ ] **ขั้นต่อไป:** รัน `ngrok http 3000` อีกครั้งเพื่อเอา URL ไปตั้งใน LINE Console → กด Verify webhook
- [ ] ปิด Greeting message / Auto-response ใน manager.line.biz
- [ ] รัน `schema.sql` สร้างฐานข้อมูลจริง
- [ ] เริ่มเขียนฟีเจอร์ตาม `docs/FEATURES.md`
