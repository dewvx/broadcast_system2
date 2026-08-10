# อ่าน CLAUDE.md ก่อนเสมอ

เอกสาร context หลักของโปรเจกต์นี้อยู่ที่ไฟล์ **`CLAUDE.md`** ที่ root ของโปรเจกต์

กรุณาอ่านไฟล์นั้นทั้งหมดก่อนเริ่มทำงานทุกครั้ง แล้วตามไปอ่านเอกสารใน `docs/` ตามหัวข้อที่เกี่ยวข้องกับงานที่กำลังทำ:
- `docs/DATABASE.md` — schema, table, column, foreign key
- `docs/FEATURES.md` — checklist ฟีเจอร์ (ทำแล้ว/ยังไม่ทำ) — **เช็คไฟล์นี้ก่อนเริ่มเขียนโค้ดเสมอ** กันเขียนซ้ำ
- `docs/ROLES.md` — permission matrix แต่ละ role
- `docs/LINE_INTEGRATION.md` — LINE Messaging API / LIFF / Webhook
- `docs/SETUP_LOG.md` — ประวัติการตั้งค่าและปัญหาที่เคยเจอมาก่อน

ไฟล์นี้ตั้งใจให้สั้น เพราะเนื้อหาจริงทั้งหมดอยู่ใน `CLAUDE.md` ไฟล์เดียว เพื่อไม่ให้เกิดข้อมูลขัดกันเวลาสลับใช้ AI หลายตัว (Claude Code, Gemini CLI, Codex CLI) ในโปรเจกต์เดียวกัน

**ห้ามแก้ tech stack, coding convention, หรือ architecture ในไฟล์นี้** — ถ้าจะเปลี่ยน ให้ไปแก้ที่ `CLAUDE.md` เท่านั้น แล้วให้ AI ตัวอื่นอ่านตามจากที่นั่น
