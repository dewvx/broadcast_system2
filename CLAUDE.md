# CLAUDE.md

แผนที่หลักของโปรเจกต์ — อ่านไฟล์นี้ก่อนทำงานทุกครั้ง แล้วตามลิงก์ไปอ่านเอกสารย่อยตามที่เกี่ยวข้อง

## โปรเจกต์คืออะไร
ระบบหอกระจายข่าวในชุมชนด้วย LINE Official Account — Web Application จัดการข่าวสาร/ประกาศ/กิจกรรม/แบบฟอร์มราชการ แล้วกระจายข่าวไปยังลูกบ้านผ่าน LINE OA

## Tech Stack
- Backend: Node.js + Express.js
- Database: MySQL (จัดการผ่าน phpMyAdmin)
- Frontend: Vite + React 18 + Tailwind CSS + React Router + Axios
- LINE: Messaging API (broadcast, webhook, chatbot) + LIFF (auth ลูกบ้าน)
- Auth ฝั่ง Admin/Leader: JWT + bcrypt (password hash)
- Auth ฝั่งลูกบ้าน: LINE LIFF (line_user_id, ไม่มี password)

> หมายเหตุ: ถ้าเอกสาร/AI ตัวอื่นแนะนำ React 19 หรือ stack อื่นที่ไม่ตรงกับตารางนี้ ให้ยึดตามไฟล์นี้เป็นหลัก เพราะเป็นเวอร์ชันที่ scaffold จริงไว้แล้วใน `frontend/package.json`

## โครงสร้างโปรเจกต์
```
backend/    -> Express API (ดู backend/src/)
frontend/   -> Vite React (ดู frontend/src/)
docs/       -> เอกสารประกอบ (อ่านตามหัวข้อด้านล่าง)
```

## เอกสารที่เกี่ยวข้อง (อ่านเพิ่มตามงานที่ทำ)
| ทำงานเกี่ยวกับ... | อ่านไฟล์ |
|---|---|
| Schema, table, column, FK | `docs/DATABASE.md` |
| ฟีเจอร์ไหนทำแล้ว/ยังไม่ทำ | `docs/FEATURES.md` |
| ใครทำอะไรได้บ้าง (permission) | `docs/ROLES.md` |
| LINE Messaging API / LIFF / Webhook | `docs/LINE_INTEGRATION.md` |

## Naming Convention
| ประเภท | รูปแบบ | ตัวอย่าง |
|---|---|---|
| React component | PascalCase | `NewsCard.jsx` |
| Function/variable | camelCase | `createNews()` |
| Database (table/column) | snake_case | `created_at`, `tb_news` |
| API route | RESTful | `/api/news`, `/api/news/:id` |

## Architecture & Coding Rules
- Backend: Controller → Service → Model
  - `controllers/` รับ request/response เท่านั้น ห้ามมี business logic ในนี้
  - `services/` เก็บ business logic จริง (คำนวณ, เรียก LINE API, validate ซับซ้อน)
  - `models/` เก็บ query function ต่อ table เท่านั้น
  - **ห้ามใส่ business logic ไว้ใน `routes/`** — routes ทำหน้าที่ map path → controller เท่านั้น
- ใช้ async/await เสมอ (ไม่ใช้ `.then()` chain) และ handle error ด้วย try/catch ทุกจุด
- พยายามให้ไฟล์ไม่เกิน ~300 บรรทัด ถ้ายาวกว่านี้ให้แตกไฟล์
- ตั้งชื่อตัวแปร/ฟังก์ชันให้สื่อความหมาย ไม่ย่อจนอ่านไม่รู้เรื่อง
- Feature-based grouping ฝั่ง frontend: จัดกลุ่มไฟล์ตามฟีเจอร์ (news, activity, document) มากกว่าตาม type ล้วนๆ เมื่อโปรเจกต์ใหญ่ขึ้น

## Auth & Security
- ทุก endpoint ที่ต้อง login ต้องผ่าน `middlewares/auth.middleware.js` (เช็ค JWT) แล้วต่อด้วย `middlewares/role.middleware.js` (เช็คสิทธิ์ตาม role)
- ห้าม insert password แบบ plain text ต้อง hash ด้วย bcrypt เสมอ
- Validate ทุก request จาก client (body, query, params) — **ห้ามเชื่อข้อมูลจาก client โดยไม่เช็ค**
- Route `/webhook` ต้อง mount **ก่อน** `express.json()` เสมอ (ดูเหตุผลใน `docs/LINE_INTEGRATION.md`)
- Query database ใช้ `mysql2/promise` ผ่าน pool ใน `src/config/db.js` ไม่ใช้ raw callback style, และต้องใช้ parameterized query เสมอ (กัน SQL Injection)

## Git Convention
- Branch: `main` (production), `develop` (รวมงาน), `feature/*`, `fix/*`, `hotfix/*`, `docs/*`
- ตัวอย่าง: `feature/login`, `feature/news`, `feature/chatbot`, `fix/auth`, `docs/update`
- Commit message ควรบอกว่าทำอะไร ไม่ใช่แค่ "update" หรือ "fix bug"

## UI Principle (Frontend)
- Minimal, Modern, Responsive, Mobile First
- ใช้ Tailwind CSS เป็นหลัก หลีกเลี่ยง inline style ยกเว้นจำเป็นจริงๆ
- คำนึงถึง Accessibility เบื้องต้น (alt text, label ผูกกับ input, contrast สี)

## สถานะปัจจุบัน
ดู checklist ล่าสุดที่ `docs/FEATURES.md` — อัปเดตทุกครั้งที่ทำฟีเจอร์เสร็จ

## AI Instruction (สำคัญ)
ก่อน generate โค้ดใดๆ:
1. อ่านไฟล์นี้ทั้งหมด + เอกสารใน `docs/` ที่เกี่ยวข้องกับงานก่อนเสมอ
2. ทำตาม architecture (Controller → Service → Model) ตามที่กำหนดไว้ ห้ามเปลี่ยนโครงสร้างโฟลเดอร์เองโดยไม่บอกเหตุผล
3. เลือกใช้ component ที่มีอยู่แล้วซ้ำ ก่อนสร้างใหม่ซ้ำซ้อน
4. เขียนโค้ดให้ clean และดูแลต่อได้ง่าย มากกว่าเน้นเขียนให้เสร็จเร็วที่สุด
5. หลังทำฟีเจอร์เสร็จ ให้ติ๊ก `[x]` ใน `docs/FEATURES.md` ทันที

> โปรเจกต์นี้พัฒนาโดยสลับใช้ AI หลายตัว (Claude Code, Gemini CLI, Codex CLI) ไฟล์นี้คือ **แหล่งความจริงเดียว** ที่ทุกตัวต้องอ่าน — `GEMINI.md` และ `AGENTS.md` เป็นแค่ตัวชี้มาที่ไฟล์นี้ ไม่มีเนื้อหาซ้ำ เพื่อกันปัญหาไฟล์ตีกันเวลาต้องแก้ context

## UI/UX Source of Truth

Before creating or modifying frontend UI, the AI must read:

- docs/DESIGN_SYSTEM.md
- docs/UI_DESIGN.md

These documents are the source of truth for all UI/UX decisions.

Do not introduce new colors, spacing, typography, components, or visual patterns without checking the existing design system first.