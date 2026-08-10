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

## Webhook

- Endpoint: `POST /webhook` (mount ก่อน `express.json()` ใน `server.js` เพราะ `@line/bot-sdk` ต้องอ่าน raw body เอง)
- ตั้งค่า Webhook URL ใน LINE Console: `https://<your-domain>/webhook`
- Dev local ใช้ ngrok/cloudflared tunnel ชี้เข้า backend แล้วเอา URL ไปตั้ง + กด Verify
- ต้องเปิด toggle "Use webhook" เป็น On

## Response Settings (ปิดใน manager.line.biz)

ต้องปิดเพื่อไม่ให้ชนกับ logic ที่เราเขียนเอง:
- Greeting messages: Off
- Auto-response messages: Off
- Webhooks: On
- Response mode: Chat/Bot (ไม่ใช่ auto)

## Flow คร่าวๆ

### ลูกบ้าน (Villager) — LIFF
1. กดเมนูใน LINE OA → เปิด LIFF app
2. `liff.init()` ดึง `line_user_id` (+ profile ถ้า scope profile ถูกติ๊ก)
3. Frontend ส่ง `line_user_id` ไป backend เช็คใน `tb_villager`
4. ถ้าไม่พบ → แสดงฟอร์มลงทะเบียน (ชื่อ, บ้านเลขที่) → insert ใหม่
5. ถ้าพบแล้ว → เข้าใช้งานต่อได้ทันที

### Admin/Leader — Broadcast ข่าว
1. เลือกข่าวที่สถานะ Approved + กลุ่มผู้รับ
2. Backend เรียก LINE Messaging API (multicast/broadcast) ส่ง Flex Message พร้อมลิงก์ไป Web App
3. บันทึกผลลง `tb_broadcast_log`

### Chatbot
1. Event `message` เข้า webhook → ค้นหา keyword ใน `tb_chatbot_faq`
2. เจอ → reply อัตโนมัติ / ไม่เจอ → แจ้ง "ไม่พบข้อมูล" + notify Admin ให้ตอบ 1-on-1

## Progress ปัจจุบัน
- [x] สร้าง Messaging API Channel
- [x] สร้าง LIFF Channel + link เข้า provider เดียวกัน
- [ ] ตั้งค่า Webhook URL + verify
- [ ] ปิด auto-reply/greeting default
- [ ] เขียน `liffAuth.service.js` verify id token ฝั่ง backend
- [ ] เขียน `chatbot.service.js` ค้นหา keyword
