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

### ลูกบ้าน (Villager) — LIFF Register [ทำเสร็จแล้ว]
1. เปิด LIFF ผ่าน LINE app → `LiffContext.jsx` เรียก `liff.init()` + `liff.getIDToken()`
2. Frontend (`RegisterPage.jsx`) ส่ง `idToken` ไป `POST /api/villager/check`
3. Backend (`villager.service.js`) verify token กับ LINE (`api.line.me/oauth2/v2.1/verify`) ได้ `line_user_id` ที่เชื่อถือได้
4. เช็คใน `tb_villager` — ไม่พบ → โชว์ฟอร์มลงทะเบียน → submit ไป `POST /api/villager/register` (verify token ซ้ำอีกรอบ) → insert
5. พบแล้ว → เข้าใช้งานทันที ไม่ต้องกรอกฟอร์มซ้ำ

ทดสอบผ่านจริงบนมือถือแล้ว มี villager_id: 1 อยู่ใน DB

### Admin — Broadcast ข่าว [ทำเสร็จแล้ว]
1. เลือกข่าวที่ `news_status = Approved` (บังคับเช็คใน `broadcast.service.js`)
2. เลือกโซนผู้รับได้ (`zoneName` ใน request body) หรือปล่อยว่าง = ส่งหาลูกบ้านทั้งหมด — ดูรายชื่อโซนที่มีจริงได้จาก `GET /api/broadcast/zones`
3. Backend สร้าง **Flex Message** (`buildNewsFlexMessage`) — การ์ดมี hero image (ถ้าข่าวมีรูป), หัวข้อ, เนื้อหาย่อ, ปุ่ม "ดูรายละเอียด"
4. เรียก `lineClient.multicast()` ส่งครั้งเดียวหาทุกคนใน list (ไม่ loop ทีละคน)
5. บันทึกผลลง `tb_broadcast_log` (จำนวนผู้รับ, ผู้ส่ง, เวลา)

ทดสอบส่งจริงถึงมือถือแล้ว เห็นการ์ด Flex Message จริง

### Chatbot [ยังไม่ทำ]
1. Event `message` เข้า webhook → ค้นหา keyword ใน `tb_chatbot_faq`
2. เจอ → reply อัตโนมัติ / ไม่เจอ → แจ้ง "ไม่พบข้อมูล" + notify Admin ให้ตอบ 1-on-1

## TODO ที่ค้างอยู่ (สำคัญ อย่าลืม)

1. **[กำลังแก้อยู่] `liff.init()` ค้างที่ `isLiffReady: false` ตลอด บนหน้า `/liff/news/:id`**
   — `/liff/register` ใช้งานได้ปกติ (เคย register สำเร็จแล้ว) แต่ `/liff/news/2` ค้างที่ "กำลังโหลดข่าว..." ตลอด ไม่มี error โผล่มา (`liffError: ไม่มี`)
   — เช็คแล้วว่า: routing ถูกต้อง (curl localhost ได้ 200 ทั้งคู่), ngrok ไม่ได้รันซ้อนกัน, `LiffContext.jsx` ใช้ `redirectUri` แบบ official แล้ว
   — ยังไม่เช็ค: `VITE_LIFF_ID` ใน `frontend/.env` มีค่าจริงมั้ย (ต้อง restart frontend หลังแก้ env ด้วย), LIFF Endpoint URL ตรงกับ ngrok domain ปัจจุบันเป๊ะมั้ย (ห้ามมี `/` เกินท้าย)
2. **`PUBLIC_APP_URL` ต้องอัปเดตมือทุกครั้งที่ ngrok restart** — เจอปัญหานี้ซ้ำหลายรอบระหว่าง debug วันนี้ พิจารณาทำ script เช็ค/แจ้งเตือนอัตโนมัติทีหลัง
3. **ตั้งเวลาส่งข่าวล่วงหน้า** (3.7) ยังไม่ทำ ต้องใช้ scheduler เพิ่ม (เช่น `node-cron`)
4. **Chatbot** ยังไม่มี logic เลย มีแค่ webhook รับ event ทั่วไปเฉยๆ

## Progress ปัจจุบัน
- [x] สร้าง Messaging API Channel + LIFF Channel + link เข้า provider เดียวกัน
- [x] Webhook verify ผ่าน + response settings ปิด auto-reply ครบ
- [x] LIFF register ลูกบ้าน (ทดสอบผ่านมือถือจริงแล้ว)
- [x] Broadcast ส่งข่าวผ่าน Flex Message + filter โซนได้ (ทดสอบส่งจริงแล้ว)
- [ ] หน้า NewsDetailPage สำหรับปุ่มลิงก์ใน Flex Message
- [ ] Chatbot ตอบอัตโนมัติ
- [ ] ตั้งเวลาส่งข่าวล่วงหน้า

## Known Issues / วิธีแก้ที่เจอมาแล้ว

- **`EADDRINUSE` ตอนรัน backend**: มี process อื่นจับ port 3000 ค้างอยู่ วิธีแก้: ปิด terminal เดิมที่รัน `npm run dev` ค้างไว้ก่อน หรือหา process ที่ใช้ port อยู่แล้ว kill ทิ้ง (`netstat -ano | findstr :3000` แล้ว `taskkill /PID <pid> /F` บน Windows)
- **`npm run dev` ติด Windows execution policy**: ถ้าเจอปัญหา PowerShell บล็อกการรัน script ให้เปลี่ยนไปใช้ `cmd.exe` แทน PowerShell หรือปรับ execution policy ของ PowerShell (`Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`)
- **ngrok URL เปลี่ยนทุกครั้งที่ restart (free plan)**: ต้องอัปเดต Webhook URL, LIFF Endpoint URL, และ `PUBLIC_APP_URL` พร้อมกันทุกครั้ง (ดูหัวข้อ "Public URL" ด้านบน)
- **`/webhook` 404 หลังเปลี่ยนมาใช้ ngrok tunnel เดียว**: ต้องเพิ่ม `/webhook` เข้า proxy list ใน `vite.config.js` ด้วย (ไม่ใช่แค่ `/api`, `/uploads`) ไม่งั้น LINE ส่ง event เข้ามาไม่ถึง backend เลย