# คำสั่งทดสอบระบบ (Command Reference)

รวมคำสั่ง curl ทั้งหมดที่ใช้ทดสอบระบบ เก็บไว้ copy ใช้ซ้ำ ไม่ต้องจำ

**หมายเหตุ:** ทุกคำสั่งรันจากโฟลเดอร์ `backend/` และต้องมี `npm run dev` รันอยู่ก่อน (`http://localhost:3000`)
ตัด `<...>` ออกเสมอตอนใส่ค่าจริง (เช่น `<ADMIN_TOKEN>` ต้องใส่ token จริงไม่มี `<` `>` ครอบ)

---

## 1. Auth (Login / สร้าง user)

### สร้าง user ใหม่ (ใช้ครั้งแรกตอนยังไม่มี user ในระบบ หรือเพิ่ม Admin/Leader คนใหม่)
```bash
node scripts/createAdmin.js <username> <password> <fullName> <roleId>
```
- `roleId`: `1` = Admin, `2` = Leader
- ตัวอย่าง:
```bash
node scripts/createAdmin.js admin admin1234 "ผู้ใหญ่บ้านทดสอบ" 1
node scripts/createAdmin.js leader1 leader1234 "ผู้นำชุมชนทดสอบ" 2
```

### Login (Admin หรือ Leader) — ได้ token กลับมาใช้ต่อในคำสั่งอื่นๆ ทั้งหมด
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin1234\"}"
```

### เช็คว่า token ที่ถืออยู่ยัง valid มั้ย + ดูข้อมูลตัวเอง
```bash
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <TOKEN>"
```

---

## 2. News (สร้าง / แก้ไข / ลบ / อนุมัติ / อัปโหลดรูป)

### ดูข่าวทั้งหมด
```bash
curl http://localhost:3000/api/news -H "Authorization: Bearer <TOKEN>"
```

### ดูข่าวรายการเดียว
```bash
curl http://localhost:3000/api/news/<news_id> -H "Authorization: Bearer <TOKEN>"
```

### สร้างข่าวใหม่ (Admin, Leader ได้ — สถานะเริ่มต้นเป็น Pending เสมอ)
```bash
curl -X POST http://localhost:3000/api/news -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d "{\"newsTitle\":\"หัวข้อข่าว\",\"newsContent\":\"เนื้อหาข่าว\",\"categoryId\":1}"
```

### แก้ไขข่าว (Admin แก้ได้ทุกข่าว / Leader แก้ได้เฉพาะข่าวตัวเองที่ยังไม่อนุมัติ)
```bash
curl -X PUT http://localhost:3000/api/news/<news_id> -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d "{\"newsTitle\":\"หัวข้อใหม่\",\"newsContent\":\"เนื้อหาใหม่\",\"categoryId\":1}"
```

### ลบข่าว (Admin เท่านั้น)
```bash
curl -X DELETE http://localhost:3000/api/news/<news_id> -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### อนุมัติข่าว (Admin เท่านั้น)
```bash
curl -X PATCH http://localhost:3000/api/news/<news_id>/approve -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### ปฏิเสธข่าว (Admin เท่านั้น)
```bash
curl -X PATCH http://localhost:3000/api/news/<news_id>/reject -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### อัปโหลดรูปภาพประกอบข่าว (Admin, Leader — เงื่อนไขสิทธิ์เหมือนแก้ไขข่าว)
```bash
curl -X POST http://localhost:3000/api/news/<news_id>/image -H "Authorization: Bearer <TOKEN>" -F "image=@ชื่อไฟล์รูป.jpg"
```

---

## 3. Category (หมวดหมู่ข่าว)

### ดูหมวดหมู่ทั้งหมด
```bash
curl http://localhost:3000/api/category -H "Authorization: Bearer <TOKEN>"
```

### สร้างหมวดหมู่ใหม่ (Admin เท่านั้น)
```bash
curl -X POST http://localhost:3000/api/category -H "Content-Type: application/json" -H "Authorization: Bearer <ADMIN_TOKEN>" -d "{\"categoryName\":\"ชื่อหมวดหมู่\"}"
```

### แก้ไขหมวดหมู่ (Admin เท่านั้น)
```bash
curl -X PUT http://localhost:3000/api/category/<category_id> -H "Content-Type: application/json" -H "Authorization: Bearer <ADMIN_TOKEN>" -d "{\"categoryName\":\"ชื่อใหม่\"}"
```

### ลบหมวดหมู่ (Admin เท่านั้น — ลบไม่ได้ถ้ามีข่าวผูกอยู่)
```bash
curl -X DELETE http://localhost:3000/api/category/<category_id> -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## 4. Broadcast (ส่งข่าวผ่าน LINE)

### ดูรายชื่อโซนที่มีลูกบ้านอยู่จริง
```bash
curl http://localhost:3000/api/broadcast/zones -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### ส่งข่าวหาลูกบ้านทั้งหมด (ต้องเป็นข่าวที่ Approved แล้วเท่านั้น)
```bash
curl -X POST http://localhost:3000/api/broadcast/<news_id> -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### ส่งข่าวเฉพาะโซนที่ระบุ
```bash
curl -X POST http://localhost:3000/api/broadcast/<news_id> -H "Content-Type: application/json" -H "Authorization: Bearer <ADMIN_TOKEN>" -d "{\"zoneName\":\"ชื่อโซน\"}"
```

---

## 5. Villager (ฝั่งลูกบ้าน — ทดสอบผ่าน curl ตรงๆ ไม่ได้ ต้องผ่าน LIFF จริงเท่านั้น)

เอกสารไว้ดูโครงสร้าง ไม่ได้ไว้ทดสอบด้วย curl เพราะต้องมี `idToken` จริงจาก LIFF SDK เท่านั้น
```
POST /api/villager/check     body: { idToken }
POST /api/villager/register  body: { idToken, firstName, lastName, houseNumber, zoneName }
POST /api/news/:id/view      body: { idToken }   -- ดูรายละเอียดข่าว (ฝั่งลูกบ้าน)
```

---

## Tips

- **Token หมดอายุใน 8 ชม.** (ตั้งไว้ใน `.env` -> `JWT_EXPIRES_IN`) ถ้า error `Token ไม่ถูกต้องหรือหมดอายุ` ให้ login ใหม่
- **Copy คำสั่งยาวๆ ไปวางใน terminal ทีเดียวรวด** ห้ามให้ตัดบรรทัด ไม่งั้น cmd จะตัดคำสั่งขาดครึ่ง
- เก็บ token ของ admin/leader1 ไว้ใน Notepad ระหว่างทดสอบ จะได้ไม่ต้อง login ใหม่ทุกรอบ