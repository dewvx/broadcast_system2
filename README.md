# ระบบหอกระจายข่าวในชุมชนด้วย LINE Official Account

Web Application สำหรับบริหารจัดการข่าวสาร กิจกรรม และเอกสารราชการของชุมชน พร้อมกระจายข่าวไปยังลูกบ้านผ่าน LINE Official Account

## Tech Stack
- Backend: Node.js, Express.js, MySQL
- Frontend: Vite + React
- LINE Messaging API + LIFF

## เริ่มต้นใช้งาน

### Backend
```bash
cd backend
npm install
cp .env.example .env   # แล้วกรอกค่าจริง (DB, JWT secret, LINE credentials)
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # กรอก VITE_API_URL, VITE_LIFF_ID
npm run dev
```

## เอกสารเพิ่มเติม
ดูโฟลเดอร์ `docs/` — `DATABASE.md`, `FEATURES.md`, `ROLES.md`, `LINE_INTEGRATION.md`

ถ้าใช้ Claude Code ในการพัฒนาต่อ ให้เริ่มอ่านจาก `CLAUDE.md` ที่ root ก่อนเสมอ
