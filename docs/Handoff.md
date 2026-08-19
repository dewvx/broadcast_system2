# Project Handoff — ระบบหอกระจายข่าวชุมชนผ่าน LINE OA

ใช้ข้อความนี้เป็น prompt แรกตอนเริ่มคุยกับ AI ตัวใหม่ (Antigravity) เพื่อให้มันเข้าใจสถานะโปรเจกต์ทันที

---

## Prompt สำหรับเริ่มต้น (copy ไปวางได้เลย)

```
นี่คือโปรเจกต์ "ระบบหอกระจายข่าวชุมชนผ่าน LINE OA" กำลังพัฒนาต่อจาก AI ตัวก่อน
ก่อนเริ่มงานใดๆ กรุณาอ่านไฟล์เหล่านี้ตามลำดับก่อน:
1. CLAUDE.md (root) - ภาพรวม tech stack, convention, architecture
2. docs/FEATURES.md - checklist ว่าทำอะไรไปแล้วบ้าง
3. docs/ROLES.md - permission matrix แต่ละ role
4. docs/LINE_INTEGRATION.md - LINE setup + known issues
5. docs/COMMANDS.md - คำสั่ง curl ทดสอบ backend ทั้งหมด

สถานะปัจจุบัน: Backend เสร็จ 100% ทุกโมดูล, Frontend Admin Dashboard กำลังทำอยู่
(ดูรายละเอียดเต็มในหัวข้อ "สถานะปัจจุบัน" และ "งานที่ต้องทำต่อ" ด้านล่างของไฟล์นี้)

งานต่อไปที่อยากให้ช่วย: [อยากให้เริ่มทำ step ถัดไปตามที่วางไว้และอยากให้สรุปทุกครั้งที่ทำอันนั้นๆเสร้จ ฟิลอธิบายครับ]
```

---

## สถานะปัจจุบัน (ภาพรวม)

### Backend — เสร็จสมบูรณ์ 100%
ทุก endpoint ทดสอบผ่าน curl แล้วทั้งหมด (ดู `docs/COMMANDS.md`):
- Auth (Login Admin/Leader, JWT)
- News (CRUD + Approval workflow + Upload รูป)
- Category (CRUD)
- LIFF Register ลูกบ้าน (verify LINE ID Token)
- Broadcast (Flex Message + เลือกโซนผู้รับ)
- Chatbot (ตอบอัตโนมัติจาก keyword matching)
- Activity, Document (CRUD)
- Report/Dashboard (สรุปสถิติ)

### Frontend — กำลังทำ Admin Dashboard
**เสร็จแล้ว:**
- Auth: `AuthContext.jsx`, `LoginPage.jsx`, `ProtectedRoute.jsx` (JWT-based, แยกจาก LIFF)
- `DashboardPage.jsx` (สรุปสถิติจาก `/api/report/*`)
- `NewsManagementPage.jsx` (list + filter + ปุ่ม ดู/แก้ไข/ลบ/อนุมัติ/ปฏิเสธ/ส่งข่าว ซ่อนตาม role)
- `NewsFormPage.jsx` (สร้าง/แก้ไขข่าว + อัปโหลดรูป)
- `NewsViewPage.jsx` (ดูข่าวแบบ read-only)
- LIFF ฝั่งลูกบ้าน: `RegisterPage.jsx`, `NewsDetailPage.jsx` (ทำงานได้ยกเว้นบั๊กที่ระบุด้านล่าง)

**ยังไม่มี UI เลย (backend พร้อมหมดแล้ว รอแค่หน้าจอ):**
- Category management page
- Activity management page
- Document management page
- Chatbot FAQ management page
- User management page (สร้าง/แก้ไข Admin-Leader ผ่าน UI แทน script)
- Admin Layout (Sidebar/Navbar ถาวร) — ตอนนี้แต่ละหน้ายังไม่มี navigation ร่วมกัน ต้องเช็คว่า Gemini เคยทำไว้หรือยัง

---

## บั๊กที่ยังค้างอยู่ (สำคัญ)

### 1. LIFF news detail หน้า `/liff/news/:id` โหลดไม่ผ่าน (`isLiffReady` ค้าง false ตลอด)
- `/liff/register` ทำงานปกติ (เคย register สำเร็จ, ทดสอบผ่านมือถือจริงแล้ว)
- `/liff/news/:id` ค้างที่ "กำลังโหลดข่าว..." ตลอด ไม่มี error (`liffError: ไม่มี`)
- **เช็คแล้วว่าไม่ใช่สาเหตุ:** routing ผิด (curl localhost ได้ 200 ทั้งคู่), ngrok รันซ้อนกัน, React StrictMode double-effect (ใส่ `useRef` guard แล้ว), `redirectUri` ของ `liff.login()`, `VITE_LIFF_ID`/Endpoint URL ผิด (เช็คแล้วถูกทั้งคู่)
- **ยังไม่ได้ทำ:** debug ผ่าน remote inspector จริง (`chrome://inspect` ต่อ Android ผ่าน USB) เพื่อดู Console/Network error จริงบนมือถือ — นี่คือ next step ที่แนะนำสำหรับบั๊กนี้ เพราะเดาจาก log ต่อไปไม่ได้ผลแล้ว

### 2. Flex Message รูปไม่ขึ้นบน LINE (เพิ่งเจอ ยังไม่ยืนยันสาเหตุ)
สงสัยว่าเป็น **ngrok free plan interstitial warning page** (`"You are about to visit..."`) ที่ขวาง LINE ไม่ให้ดึงรูปได้ตรงๆ (เพราะได้ HTML แทนที่จะเป็นรูปจริง) — ยังไม่ได้ทดสอบยืนยัน 100%
**วิธีทดสอบ:** เปิด URL รูปเต็มๆ ผ่านมือถือ/เน็ตที่ไม่เคยเข้าเว็บนี้มาก่อน ถ้าเจอหน้า ngrok warning ก่อนเห็นรูป แปลว่าใช่
**วิธีแก้ที่เป็นไปได้:** เปลี่ยนจาก ngrok free ไปใช้ Cloudflare Tunnel (ฟรี ไม่มี interstitial) หรืออัปเกรด ngrok paid plan

### 3. Document ลบ record แต่ไม่ลบไฟล์จริง
`document.service.js` -> `deleteDocument()` ลบแค่แถวใน DB ไม่ได้ `fs.unlink()` ไฟล์ในโฟลเดอร์ `public/uploads/` ทิ้งด้วย (เป็นการตัดสินใจตอนนั้นเพื่อความปลอดภัย กันเผลอลบผิด) — ถ้าจะทำให้ครบต้องเพิ่ม logic ลบไฟล์จริงด้วย

---

## งานที่ต้องทำต่อ (เรียงตามที่แนะนำ)

1. **Admin Layout (Sidebar/Navbar)** — ถ้ายังไม่มี ควรทำก่อนเพิ่มหน้าใหม่ๆ ต่อ จะได้มี navigation รวมศูนย์ ไม่ต้องแปะลิงก์เองทุกหน้า
2. **Category management page** — ง่ายสุด, backend พร้อมแล้ว (`category.api.js` มีอยู่แล้วจาก `NewsFormPage` ที่ import `getAllCategories`)
3. **Activity management page** — pattern เดียวกับ Category (ไม่มี workflow อนุมัติ)
4. **Document management page** — เหมือน Category แต่มีอัปโหลดไฟล์ (ดู `documentUpload.middleware.js` field name คือ `document`)
5. **Chatbot FAQ management page** — Admin จัดการคำถาม-คำตอบ (`chatbot-faq` API พร้อมแล้ว)
6. **User management page** — Admin สร้าง/ดู user คนอื่นผ่าน UI (ตอนนี้ backend ยังไม่มี endpoint list/create user เลย มีแค่ `scripts/createAdmin.js` ฝั่ง CLI — **ต้องเพิ่ม backend endpoint ก่อนถึงจะทำหน้านี้ได้**)
7. **แก้บั๊ก LIFF news detail** (ข้อ 1 ด้านบน) — ควรเจาะผ่าน remote debugging จริง
8. **แก้ปัญหา Flex Message รูปไม่ขึ้น** (ข้อ 2 ด้านบน)
9. **ฟีเจอร์เสริมที่ยังไม่ทำ:** ตั้งเวลาส่งข่าวล่วงหน้า (`node-cron`), ลบไฟล์จริงตอนลบ Document, Activity/Document ฝั่งลูกบ้าน (LIFF) ยังดูไม่ได้เลย (เหมือนที่ News เคยขาด detail page)

---

## ข้อควรระวังเวลาทำงานต่อ (บทเรียนที่เจอมาระหว่างทาง)

- **ngrok URL เปลี่ยนทุกครั้งที่ restart (free plan)** ต้องอัปเดต 3 จุดพร้อมกันเสมอ: `backend/.env` -> `PUBLIC_APP_URL`, LIFF Endpoint URL, Webhook URL
- **Vite proxy ต้องมี `/api`, `/uploads`, `/webhook` ครบ** ใน `vite.config.js` (เคยลืม `/webhook` มาก่อน ทำให้ chatbot พังทั้งที่ backend ถูก)
- **ทุกครั้งที่แก้ `.env` ต้อง restart server นั้นด้วย** (backend หรือ frontend แล้วแต่ไฟล์ไหนถูกแก้) ไม่ใช่แค่ save เฉยๆ
- ระวังไฟล์ frontend/backend หลุด sync กันเวลาสลับใช้หลาย AI (Claude/Gemini/Codex) — ทางที่ดีที่สุดคือขอให้ AI ตัวใหม่แสดงเนื้อหาไฟล์ปัจจุบันก่อนแก้ทุกครั้ง แทนที่จะเดาจากบทสนทนาเก่า