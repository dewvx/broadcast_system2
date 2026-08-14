require('dotenv').config();
const express = require('express');
const cors = require('cors');

const errorHandler = require('./src/middlewares/errorHandler');
const webhookRoutes = require('./src/routes/webhook.routes');

const app = express();

app.use(cors());

// สำคัญ: mount /webhook ก่อน express.json()
// เพราะ line.middleware() ต้องอ่าน raw body เองเพื่อตรวจ signature
// ถ้า express.json() แย่งอ่าน body ไปก่อน จะ verify signature ไม่ผ่าน
app.use('/webhook', webhookRoutes);

// route อื่นๆ ถัดจากนี้ใช้ json parser ปกติได้เลย
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// เปิดให้เข้าถึงไฟล์ที่อัปโหลดไว้ผ่าน URL ได้ เช่น http://localhost:3000/uploads/news_xxx.jpg
app.use('/uploads', express.static('public/uploads'));

// ตัวอย่าง health check
app.get('/', (req, res) => {
  res.json({ message: 'Village News API is running' });
});

// TODO: เพิ่ม route อื่นๆ ที่นี่ เช่น
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/news', require('./src/routes/news.routes'));
app.use('/api/category', require('./src/routes/category.routes'));
app.use('/api/villager', require('./src/routes/villager.routes'));
app.use('/api/broadcast', require('./src/routes/broadcast.routes'));
app.use('/api/chatbot-faq', require('./src/routes/chatbotFaq.routes'));
app.use('/api/activity', require('./src/routes/activity.routes'));
app.use('/api/document', require('./src/routes/document.routes'));
app.use('/api/report', require('./src/routes/report.routes'));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});