const multer = require('multer');
const path = require('path');

// ตั้งค่าว่าไฟล์ที่อัปโหลดเข้ามา จะถูกเก็บที่ไหน ชื่อไฟล์อะไร
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    // ตั้งชื่อไฟล์ใหม่กันชนกัน: timestamp + นามสกุลเดิม
    // เช่น news_1723200000000.jpg
    const ext = path.extname(file.originalname);
    const uniqueName = `news_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น
function fileFilter(req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('รองรับเฉพาะไฟล์ .jpg .png .webp เท่านั้น'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัด 5MB ต่อไฟล์
});

module.exports = upload;