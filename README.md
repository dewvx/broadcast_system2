# ระบบหอกระจายข่าวในชุมชนด้วย LINE Official Account

Web Application สำหรับบริหารจัดการข่าวสาร กิจกรรม และเอกสารราชการของชุมชน พร้อมกระจายข่าวไปยังลูกบ้านผ่าน LINE Official Account

## Tech Stack
- Backend: Node.js, Express.js, MySQL
- Frontend: Vite + React
- LINE Messaging API + LIFF

## สถานะปัจจุบัน
- [x] Login Admin/Leader (JWT + bcrypt)
- [x] /me session check
- [x] News CRUD + approval flow
- [x] Category CRUD
- [x] LIFF villager registration flow (check/register via LINE ID token)
- [ ] Webhook verify + LINE event handling
- [ ] Admin account management CRUD
- [ ] Activity management
- [ ] Document upload/download
- [ ] Broadcast/news sending via LINE OA
- [ ] Chatbot FAQ / fallback

## เริ่มต้นใช้งาน

### Backend
```bash
cd backend
npm install
copy .env.example .env   # หรือ cp .env.example .env ถ้าใช้ bash/zsh
# กรอกค่าจริง: DB, JWT_SECRET, LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN, LIFF_CHANNEL_ID
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
node server.js
```

> หมายเหตุสำหรับ Windows: หาก `npm run dev` error ว่า `running scripts is disabled` ให้ใช้ `node server.js` โดยตรง หรือรัน `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` ก่อน

### Frontend
```bash
cd frontend
npm install
copy .env.example .env   # หรือ cp .env.example .env ถ้าใช้ bash/zsh
# กรอก VITE_API_URL, VITE_LIFF_ID
npm run dev
```

## การตั้งค่า LINE / LIFF
- Messaging API Channel: สำหรับส่งอีเมล/ข้อความและ webhook
- LIFF Channel: สำหรับ login ของลูกบ้านผ่าน LINE
- `VITE_LIFF_ID` ใน frontend ต้องตรงกับ LIFF Channel ID จริง
- `LIFF_CHANNEL_ID` ใน backend ต้องตรงกับ LINE Login channel เดียวกัน
- `idToken` ต้องมาจาก LINE Login ที่ login จริง เช่น เปิดจาก LIFF app ไม่ใช่ browser ทั่วไป

## Troubleshooting

### 1) `POST /api/villager/register` 404
- ตรวจว่า backend เริ่มทำงานจริงบน port ที่ถูกต้อง
- ตรวจว่า frontend ส่งไปที่ URL ที่ตรงกับ tunnel/server จริง
- ตรวจว่า port 3000 ไม่กำลังถูก process อื่นใช้งานอยู่ (`EADDRINUSE`)

### 2) `EADDRINUSE: address already in use :::3000`
- หยุด process ที่ใช้ port 3000 หรือเปลี่ยน port การรันใน `backend/server.js`
- ตัวอย่างการตรวจ:
```powershell
netstat -ano | findstr :3000
```

### 3) `idToken` เป็น null หรือ verification ล้มเหลว
- ตรวจว่าเปิด app จาก LINE LIFF จริง ๆ
- ตรวจว่า `VITE_LIFF_ID` และ `LIFF_CHANNEL_ID` ตรงกับ channel จริง
- ตรวจว่า scope ของ LIFF ครอบคลุม `openid`/profile ตามที่ต้องใช้

### 4) `npm run dev` ไม่ทำงานบน Windows
- ใช้:
```powershell
cd backend
node server.js
```
- หรือรันคำสั่งด้านบนก่อนเพื่อ bypass policy ชั่วคราว:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## เอกสารเพิ่มเติม
ดูโฟลเดอร์ `docs/` — `DATABASE.md`, `FEATURES.md`, `ROLES.md`, `LINE_INTEGRATION.md`, `SETUP_LOG.md`

ถ้าใช้ Claude Code ในการพัฒนาต่อ ให้เริ่มอ่านจาก `CLAUDE.md` ที่ root ก่อนเสมอ
