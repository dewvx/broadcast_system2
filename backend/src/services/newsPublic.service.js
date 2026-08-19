const newsModel = require('../models/news.model');

/**
 * ดึงรายการข่าวสำหรับฝั่งลูกบ้าน - เฉพาะข่าวที่ Approved แล้วเท่านั้น
 * ไม่ต้อง auth เพราะข่าวเหล่านี้ถูก broadcast ออกไปหาสาธารณะอยู่แล้ว (ไม่มีข้อมูลส่วนตัวปน)
 */
async function getPublicNewsList() {
  const allNews = await newsModel.findAll();
  return allNews
    .filter((item) => item.news_status === 'Approved')
    .map((item) => ({
      news_id: item.news_id,
      news_title: item.news_title,
      news_image: item.news_image,
      category_id: item.category_id,
      category_name: item.category_name,
      view_count: item.view_count || 0,
      created_at: item.created_at,
    }));
}

module.exports = { getPublicNewsList };