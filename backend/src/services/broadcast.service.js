const broadcastModel = require('../models/broadcast.model');
const newsModel = require('../models/news.model');
const { lineClient } = require('../config/line');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

/**
 * ประกอบข้อความข่าวเป็น LINE Flex Message (การ์ดสวยๆ มีรูป + ปุ่มลิงก์)
 * เอกสาร: https://developers.line.biz/en/docs/messaging-api/flex-message-elements/
 *
 * โครงสร้าง Flex Message แบบ "bubble":
 *   hero    -> รูปภาพด้านบนสุด (ใส่เฉพาะตอนข่าวมีรูป)
 *   body    -> หัวข้อ + เนื้อหาย่อ
 *   footer  -> ปุ่มกดดูรายละเอียด
 */
function buildNewsFlexMessage(news) {
  const baseUrl = process.env.PUBLIC_APP_URL;

  // ตัดเนื้อหาข่าวให้สั้นลง กันข้อความยาวเกินจนการ์ดสูงเกะกะ (LINE ไม่ได้บังคับ แต่ UX จะดีกว่า)
  const previewText =
    news.news_content.length > 100 ? news.news_content.slice(0, 100) + '...' : news.news_content;

  const targetUri = process.env.LIFF_ID
    ? `https://liff.line.me/${process.env.LIFF_ID}/news/${news.news_id}`
    : `${baseUrl}/liff/news/${news.news_id}`;

  const bubble = {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        { type: 'text', text: news.news_title, weight: 'bold', size: 'lg', wrap: true },
        { type: 'text', text: previewText, size: 'sm', color: '#666666', wrap: true, margin: 'md' },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: '#16a34a',
          action: {
            type: 'uri',
            label: 'ดูรายละเอียด',
            uri: targetUri,
          },
        },
      ],
    },
  };

  // ใส่ hero image เฉพาะตอนข่าวมีรูปแนบมาจริง
  if (news.news_image) {
    bubble.hero = {
      type: 'image',
      url: `${baseUrl}${news.news_image}`,
      size: 'full',
      aspectRatio: '20:13',
      aspectMode: 'cover',
    };
  }

  return {
    type: 'flex',
    altText: news.news_title, // ข้อความสำรอง โชว์ตอนเปิดจากการแจ้งเตือน/รุ่นเก่าที่ไม่รองรับ flex
    contents: bubble,
  };
}

/**
 * Core logic การส่งข่าวจริงผ่าน LINE — ใช้ร่วมกันทั้ง "ส่งทันที" (API) และ
 * "ตั้งเวลาส่ง" (scheduler job) เพื่อไม่ให้ logic Flex Message/multicast/log ซ้ำกัน
 * คืน { logId, totalReceived } หรือ throw Error ถ้าส่งไม่ได้
 */
async function executeBroadcast(newsId, zoneName, sentByUserId) {
  if (!process.env.PUBLIC_APP_URL) {
    throwError('ยังไม่ได้ตั้งค่า PUBLIC_APP_URL ใน .env กรุณาตั้งค่าก่อนส่งข่าว', 500);
  }

  const news = await newsModel.findById(newsId);
  if (!news) throwError('ไม่พบข่าวนี้', 404);

  if (news.news_status !== 'Approved') {
    throwError('ส่งได้เฉพาะข่าวที่อนุมัติแล้วเท่านั้น', 400);
  }

  const lineIds = await broadcastModel.getVillagerLineIds(zoneName);
  if (lineIds.length === 0) {
    const scope = zoneName ? `ในโซน "${zoneName}"` : 'ในระบบเลย';
    throwError(`ยังไม่มีลูกบ้านลงทะเบียน${scope} ไม่สามารถส่งข่าวได้`, 400);
  }

  await lineClient.multicast({
    to: lineIds,
    messages: [buildNewsFlexMessage(news)],
  });

  const logId = await broadcastModel.createLog({
    newsId,
    sentBy: sentByUserId,
    totalReceived: lineIds.length,
  });

  return { logId, totalReceived: lineIds.length };
}

async function broadcastNews(newsId, zoneName, currentUser) {
  if (currentUser.roleName !== 'Admin') {
    throwError('เฉพาะผู้ใหญ่บ้านเท่านั้นที่ส่งข่าวได้', 403);
  }

  const result = await executeBroadcast(newsId, zoneName, currentUser.userId);

  return { ...result, zoneName: zoneName || 'ทั้งหมด' };
}

async function getZones() {
  return broadcastModel.getAllZones();
}

module.exports = { broadcastNews, getZones, executeBroadcast };