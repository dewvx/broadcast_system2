# Scheduled Broadcast Audit — สรุปผลตรวจระบบตั้งเวลาส่งข่าว

> ตรวจเมื่อ: 2026-08-24
> Scope: `backend/src/services/scheduledBroadcast.service.js`, `backend/src/jobs/broadcastScheduler.job.js`, `backend/src/models/scheduledBroadcast.model.js`, `backend/src/routes/broadcast.routes.js`

## 1. Timezone — ⚠️ เป็น "naive local time" เทียบข้ามระบบนาฬิกา

- `scheduleNews()` รับ `"YYYY-MM-DDTHH:mm"` จาก `<input type="datetime-local">` (ไม่มี timezone suffix) → `new Date(scheduledAt)` parse เป็น **local time ของ Node process** (`scheduledBroadcast.service.js:25`)
- ตัด `T` เป็นช่องว่างแล้วเก็บลง MySQL DATETIME แบบ naive (`scheduledBroadcast.service.js:45`)
- ตอนเทียบ: `scheduled_at <= NOW()` ใช้ **timezone ฝั่ง MySQL session** (`scheduledBroadcast.model.js:59`)
- **สรุป:** ถูกต้องก็ต่อเมื่อ TZ ของ Node == MySQL (เช่น ทั้งคู่ Asia/Bangkok) — dev บน Windows local โอเค แต่ deploy ขึ้น cloud/server ที่ Node เป็น UTC จะส่งพลาดเวลา ~6 ชม.

**ข้อเสนอแนะ:** set `TZ=Asia/Bangkok` ทั้ง Node process และ MySQL session/timezone ก่อน deploy จริง หรือเก็บเป็น UTC ให้ชัดเจนทั้ง pipeline

## 2. Cron + กันส่งซ้ำ — ✅ มี claim lock

- Cron วิ่ง `* * * * *` = **ทุก 1 นาที** (`broadcastScheduler.job.js:22`)
- กันส่งซ้ำด้วย **atomic claim**: `UPDATE ... SET status='Sending' WHERE schedule_id=? AND status='Pending'` แล้วเช็ค `affectedRows > 0` (`scheduledBroadcast.model.js:69-76`) — ถ้า job วิ่งชนกัน/restart ซ้อน ตัวที่ claim ไม่ได้จะ skip
- ⚠️ **Edge case (at-least-once):** ถ้า crash *หลัง* LINE API ส่งสำเร็จแต่ *ก่อน* `markSent` — งานติด `'Sending'` ครบ 10 นาที (`STALE_SENDING_MINUTES`) จะถูก reset เป็น Pending แล้ว**ส่งซ้ำ** — tradeoff ที่ยอมรับได้ แต่ควรรับรู้

## 3. Server ปิดตอนถึงเวลาส่ง — ✅ ส่งย้อนหลัง ไม่ข้าม

- `findDueSchedules` เลือก `Pending AND scheduled_at <= NOW()` — overdue รวมอยู่
- ตอน startup `startBroadcastScheduler()` เรียก `processDueSchedules()` ทันที 1 ครั้ง (`broadcastScheduler.job.js:13-20`) → ข่าว overdue ถูกส่งทันทีที่ server ขึ้น ✓

## 4. Re-check สถานะ Approved ก่อนส่ง — ✅ มี

- `executeBroadcast()` เช็ค `news.news_status !== 'Approved'` → throw 400 (`broadcast.service.js:90-92`)
- กรณี Admin reject ระหว่างรอเวลา = schedule เปลี่ยนเป็น `Failed` พร้อม error message ให้ Admin เห็น (`markFailed`, model.js:84-91) ไม่ส่งออกไป ✓

## 5. ใครตั้งเวลาได้ — ✅ Admin เท่านั้น (guard 2 ชั้น)

| Endpoint | Guard |
|---|---|
| `POST /:newsId/schedule` | `roleMiddleware(['Admin'])` (`broadcast.routes.js:15`) + service check `roleName !== 'Admin'` → 403 (`scheduledBroadcast.service.js:18-20`) |
| `GET /zones`, `GET /scheduled` | Admin only (`broadcast.routes.js:8,12`) |
| `DELETE /schedule/:scheduleId` | Admin only (`broadcast.routes.js:18`) |

- ⚠️ `docs/ROLES.md` **ไม่มี row** "ตั้งเวลา/ยกเลิกส่งข่าว" โดยตรง — cover อยู่ใต้ "เลือกกลุ่มผู้รับ + ส่งข่าว" (Admin only) ซึ่ง consistent แต่ควรเพิ่ม row ให้ชัดเจน

## 6. ยกเลิก/แก้ไข — ยกเลิกได้ / แก้ไขไม่ได้

- **ยกเลิก:** ✅ ได้เฉพาะสถานะ Pending (`cancelSchedule WHERE status='Pending'`, `scheduledBroadcast.model.js:108-115`) — ถ้า Sending/Sent/Failed จะ throw 400
- **แก้ไขเวลา:** ❌ ไม่มี endpoint reschedule — ต้อง cancel แล้วสร้างใหม่
- **ข้อเสนอแนะ (optional):** เพิ่ม `PATCH /api/broadcast/schedule/:id` สำหรับแก้ `scheduled_at`/`zone_name` เฉพาะ Pending

## สรุป

Logic ปลอดภัยรอบด้าน (atomic claim, startup catch-up, re-check status, role guard 2 ชั้น)
— จุดเดียวที่ต้องแก้จริงจังคือ **timezone (ข้อ 1)** ก่อน deploy production
