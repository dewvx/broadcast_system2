สรุปงานทั้งหมด
1. ปรับปรุง LiffContext.jsx
เพิ่ม React imports และสร้าง LiffProvider / useLiff() hook ให้ครบ
แก้ปัญหา LIFF SDK not found on window.liff
เดิมใช้ window.liff เป็นหลัก
แก้เป็น import liff จาก @line/liff โดยตรง
2. ปรับ flow ของ LIFF login
เมื่อยังไม่ได้ login:
เก็บ path ปัจจุบันไว้ใน sessionStorage (liff_redirect_path)
เรียก liff.login() พร้อม redirectUri เป็น root ของเว็บ
เมื่อกลับมาจาก LINE login:
เช็ค sessionStorage
ถ้ามี route เก็บไว้ และ path ปัจจุบันไม่ตรง ให้ window.location.replace(savedPath) เพื่อ restore route เดิม
3. ตรวจสอบ routing / provider
ยืนยันว่า LiffProvider ถูก mount ใน index.jsx
Page RegisterPage กับ NewsDetailPage ใช้ useLiff() แล้ว
4. ตรวจสอบ dependency / build
ยืนยันว่า @line/liff ติดตั้งแล้วใน frontend
รัน npm run build แล้วสำเร็จ
สาเหตุของปัญหาที่เจอ
window.liff อาจยังไม่ถูกสร้างหรืออ้างอิงผิดเวลา
LINE login บางครั้งจะไม่คืน URL เดิมตามที่ต้องการ
ทางแก้คือใช้ module @line/liff โดยตรง และเก็บ/restore route เอง
