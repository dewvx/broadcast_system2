# LINE Integration

ระบบใช้ 2 channel จาก LINE Developers Console อยู่ใน Provider เดียวกัน:

1. **Messaging API Channel** — ตัว LINE OA จริง ใช้ส่ง/รับข้อความ
2. **LINE Login Channel (LIFF)** — ใช้ยืนยันตัวตนลูกบ้านผ่าน Web App ใน LINE

ทั้งสอง channel ต้อง **link กัน** ผ่าน "Linked bots" / "Add friend option" ในหน้า Basic settings ของ LIFF channel (ต้องอยู่ provider เดียวกัน และ login account เดียวกันต้องเป็น admin ของทั้งคู่)

## Environment Variables ที่ต้องมี

**Backend** (`backend/.env`)
```
LINE_CHANNEL_SECRET=        # แท็บ Basic settings ของ Messaging API channel
LINE_CHANNEL_ACCESS_TOKEN=  # แท็บ Messaging API > Issue channel access token (long-lived)
LIFF_CHANNEL_ID=            # ใช้ตอน verify LIFF id token ฝั่ง backend (ทำทีหลัง)
```

**Frontend** (`frontend/.env`)
```
VITE_LIFF_ID=               # แท็บ LIFF ของ LINE Login channel เช่น 1234567890-abcdefgh
```

## Public URL (สำคัญ ต้องอัปเดตมือทุกครั้งที่ ngrok restart)

`PUBLIC_APP_URL` ใช้สร้าง URL เต็มสำหรับ:
- รูปภาพใน Flex Message (`hero` block) — LINE ต้องดึงรูปจาก URL จริงบนอินเทอร์เน็ต ใช้ path สัมพัทธ์ไม่ได้
- ปุ่มลิงก์ "ดูรายละเอียด" ใน Flex Message

ทุกครั้งที่ restart `ngrok http 5173` แล้วได้ URL ใหม่ ต้องอัปเดต **3 จุดพร้อมกัน**:
1. `backend/.env` → `PUBLIC_APP_URL`
2. LINE Console → LIFF channel → Endpoint URL
3. LINE Console → Messaging API channel → Webhook URL (ต่อท้ายด้วย `/webhook`)

## Webhook

- Endpoint: `POST /webhook` (mount ก่อน `express.json()` ใน `server.js` เพราะ `@line/bot-sdk` ต้องอ่าน raw body เอง)
- ตั้งค่า Webhook URL ใน LINE Console: `https://<ngrok-url>/webhook`
- Dev local ใช้ ngrok tunnel เดียว ชี้ไป **frontend (port 5173)** ไม่ใช่ backend โดยตรง — Vite proxy จะส่งต่อ `/api` และ `/uploads` ไปหา backend (`localhost:3000`) ให้เอง กันปัญหา 2 tunnel คนละ URL ชนกัน
- [x] Verify ผ่านแล้ว, toggle "Use webhook" เปิดอยู่

## Response Settings (manager.line.biz)

- [x] Greeting messages: Off
- [x] Auto-response messages: Off
- [x] Webhooks: On
- [x] Response mode: Chat (แบบแมนนวล ผ่าน webhook เราเอง)
- [x] "เวลาตอบข้อความ" (business hours) ปิดไว้ด้วย กันช่วงนอกเวลาแอบใช้ auto-reply

## Flow การทำงาน

### ลูกบ้าน (Villager) — LIFF Register + OTP [ทำเสร็จแล้ว]
1. เปิด LIFF ผ่าน LINE app → `LiffContext.jsx` เรียก `liff.init()` + `liff.getIDToken()`
2. Frontend (`RegisterPage.jsx`) ส่ง `idToken` ไป `POST /api/villager/check`
3. Backend (`villager.service.js`) verify token กับ LINE (`api.line.me/oauth2/v2.1/verify`) ได้ `line_user_id` ที่เชื่อถือได้
4. เช็คใน `tb_villager`:
   - **พบแล้ว:** เข้าสู่ระบบทันที (redirect ไปหน้า `/liff/home`)
   - **ไม่พบ:** แสดงฟอร์มลงทะเบียน (ชื่อ, นามสกุล, บ้านเลขที่, ซอย/คุ้ม) พร้อมปุ่มกดขอรหัสยืนยัน OTP
5. **ขอ OTP:** Frontend ส่ง `idToken` ไป `POST /api/villager/send-otp` (มี IP Rate Limit 10 ครั้ง/15 นาที) → Backend สุ่ม OTP 6 หลัก บันทึกลง `tb_villager_otp` แล้วส่งหาลูกบ้านทาง **LINE Push Message** ทันที (มี Cooldown 60 วินาที, หมดอายุใน 5 นาที)
6. **ยืนยันการลงทะเบียน:** ส่งข้อมูลพร้อม `otpCode` และ `pdpaConsent: true` ไป `POST /api/villager/register`
   - Backend ตรวจสอบ OTP ถูกต้อง (จำกัดกรอกผิดไม่เกิน 5 ครั้ง)
   - บันทึกลง `tb_villager` (บังคับเลือกซอย/คุ้ม) สำเร็จ

### Webhook Event Handler (Unfollow / Block) [ทำเสร็จแล้ว]
- เมื่อลูกบ้านกดบล็อกหรือยกเลิกติดตาม LINE OA → LINE ส่ง Webhook event `unfollow` เข้ามา
- Controller ใน `webhook.controller.js` จะปรับ `is_active = 0` ใน `tb_villager` อัตโนมัติ เพื่อระงับการส่ง Push Message / Broadcast หาผู้ใช้คนนั้นตามข้อกำหนด PDPA

### Admin — Broadcast ข่าว [ทำเสร็จแล้ว]
1. เลือกข่าวที่ `news_status = Approved` (บังคับเช็คใน `broadcast.service.js`)
2. เลือกโซนผู้รับได้ (`zoneName` ใน request body) หรือปล่อยว่าง = ส่งหาลูกบ้านทั้งหมด — ดูรายชื่อโซนที่มีจริงได้จาก `GET /api/broadcast/zones`
3. Backend สร้าง **Flex Message** (`buildNewsFlexMessage`) — การ์ดมี hero image (ถ้าข่าวมีรูป), หัวข้อ, เนื้อหาย่อ, ปุ่ม "ดูรายละเอียด" ชี้ไปที่ `https://liff.line.me/${LIFF_ID}/news/${news_id}`
4. เรียก `lineClient.pushMessage()` หรือส่งตามรายชื่อลูกบ้านที่ `is_active = 1` และ `is_deleted = 0`
5. บันทึกผลลง `tb_broadcast_log` (จำนวนผู้รับ, ผู้ส่ง, เวลา)

### Chatbot ถาม-ตอบอัตโนมัติ [ทำเสร็จแล้ว]
1. Event `message` เข้า webhook → ตรวจสอบข้อความกับตาราง `tb_chatbot_faq` (ค้นหาตรงตัว หรือตรวจ Keyword ในคำถาม)
2. **พบคำตอบ:** ตอบกลับข้อความทันทีด้วยคำตอบที่ตั้งไว้ พร้อมบันทึก `is_matched = 1` ลง `tb_chatbot_log`
3. **ไม่พบคำตอบ:** ส่ง Flex Message เป็นเมนูด่วน (Quick Reply Card) แนะนำบริการ เช่น เมนูข่าวสาร, ปฏิทินกิจกรรม, แบบฟอร์มเอกสาร, เบอร์ติดต่อฉุกเฉิน และบันทึก `is_matched = 0` ลง `tb_chatbot_log` เพื่อให้ Admin นำไปปรับปรุง FAQ ต่อไป

## สรุปสถานะฟังก์ชันที่ทำเสร็จแล้ว
- [x] สร้าง Messaging API Channel + LIFF Channel + link เข้า provider เดียวกัน
- [x] Webhook verify ผ่าน + response settings ปิด auto-reply ครบ
- [x] LIFF register ลูกบ้าน พร้อมยืนยัน OTP ผ่าน LINE Push Message (ทดสอบผ่านมือถือจริงแล้ว)
- [x] Broadcast ส่งข่าวผ่าน Flex Message + filter โซนได้ (ทดสอบส่งจริงแล้ว)
- [x] หน้า NewsDetailPage สำหรับปุ่มลิงก์ใน Flex Message
- [x] หน้า ActivityListPage (`/liff/activities`) และ DocumentListPage (`/liff/documents`) ฝั่งลูกบ้าน
- [x] Chatbot ตอบอัตโนมัติ (เชื่อมต่อ LINE Webhook + `tb_chatbot_faq` Keyword matching + Quick Reply Card fallback)
- [x] บันทึกประวัติคำถามแชทบอทลง `tb_chatbot_log` พร้อมหน้า Dashboard จัดการ FAQ และดู Log
- [x] ตั้งเวลาส่งข่าวล่วงหน้า (node-cron + `tb_scheduled_broadcast` พร้อม Startup Recovery)
- [x] Webhook Unfollow Handler ปรับ `is_active = 0` เมื่อลูกบ้านบล็อก OA ตามกฎ PDPA

## API เกี่ยวกับ Broadcast

| Method | Path | คำอธิบาย |
|---|---|---|
| POST | `/api/broadcast/:newsId` | ส่งทันที (body: `zoneName?`) |
| POST | `/api/broadcast/:newsId/schedule` | ตั้งเวลาส่ง (body: `zoneName?`, `scheduledAt` = "YYYY-MM-DD HH:mm" local time) |
| GET | `/api/broadcast/scheduled?status=Pending` | รายการตารางส่ง (ไม่ใส่ status = ทุกสถานะ) |
| DELETE | `/api/broadcast/schedule/:scheduleId` | ยกเลิก (ได้เฉพาะ Pending) |
| GET | `/api/broadcast/zones` | รายชื่อโซนที่มีลูกบ้านจริง |

ทุก endpoint require JWT + role Admin. หมายเหตุ: `scheduled_at` เทียบกับ `NOW()` ของ MySQL — dev เครื่องเดียวกัน timezone ตรงกันอัตโนมัติ แต่ถ้า deploy server/DB คนละ timezone ต้องตั้ง MySQL timezone ให้ตรงกับ app

## Known Issues / วิธีแก้ที่เจอมาแล้ว

- **`EADDRINUSE` ตอนรัน backend**: มี process อื่นจับ port 3000 ค้างอยู่ วิธีแก้: ปิด terminal เดิมที่รัน `npm run dev` ค้างไว้ก่อน หรือหา process ที่ใช้ port อยู่แล้ว kill ทิ้ง (`netstat -ano | findstr :3000` แล้ว `taskkill /PID <pid> /F` บน Windows)
- **`npm run dev` ติด Windows execution policy**: ถ้าเจอปัญหา PowerShell บล็อกการรัน script ให้เปลี่ยนไปใช้ `cmd.exe` แทน PowerShell หรือปรับ execution policy ของ PowerShell (`Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`)
- **ngrok URL เปลี่ยนทุกครั้งที่ restart (free plan)**: ต้องอัปเดต Webhook URL, LIFF Endpoint URL, และ `PUBLIC_APP_URL` พร้อมกันทุกครั้ง (ดูหัวข้อ "Public URL" ด้านบน)
- **`/webhook` 404 หลังเปลี่ยนมาใช้ ngrok tunnel เดียว**: ต้องเพิ่ม `/webhook` เข้า proxy list ใน `vite.config.js` ด้วย (ไม่ใช่แค่ `/api`, `/uploads`) ไม่งั้น LINE ส่ง event เข้ามาไม่ถึง backend เลย