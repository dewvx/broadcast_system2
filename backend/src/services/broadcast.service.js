const broadcastModel = require('../models/broadcast.model');
const newsModel = require('../models/news.model');
const activityModel = require('../models/activity.model');
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

  const bodyContents = [
    { type: 'text', text: news.news_title, weight: 'bold', size: 'lg', wrap: true },
    { type: 'text', text: previewText, size: 'sm', color: '#666666', wrap: true, margin: 'md' },
  ];

  if (news.act_title) {
    const actDateThai = formatThaiDate(news.act_date);
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '10px',
      backgroundColor: '#f0fdfa',
      cornerRadius: 'md',
      contents: [
        {
          type: 'text',
          text: `📅 กิจกรรม: ${news.act_title}`,
          weight: 'bold',
          size: 'xs',
          color: '#0f766e',
          wrap: true,
        },
        {
          type: 'text',
          text: `🗓 ${actDateThai}${news.act_location ? ` | 📍 ${news.act_location}` : ''}`,
          size: 'xxs',
          color: '#0f766e',
          wrap: true,
          margin: 'xs',
        },
      ],
    });
  }

  const bubble = {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: bodyContents,
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

function formatThaiDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const day = d.getDate();
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  } catch {
    return String(dateStr);
  }
}

/**
 * ประกอบข้อความกิจกรรมเป็น LINE Flex Message
 */
function buildActivityFlexMessage(activity) {
  const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5000';
  const thaiDate = formatThaiDate(activity.act_date);

  const previewText = activity.act_content
    ? (activity.act_content.length > 90 ? activity.act_content.slice(0, 90) + '...' : activity.act_content)
    : 'ขอเชิญลูกบ้านเข้าร่วมกิจกรรมชุมชนตามวันและเวลาดังกล่าว';

  const targetUri = process.env.LIFF_ID
    ? `https://liff.line.me/${process.env.LIFF_ID}/activities/${activity.act_id}`
    : `${baseUrl}/liff/activities/${activity.act_id}`;

  const bubble = {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0f766e',
      paddingAll: '16px',
      contents: [
        {
          type: 'text',
          text: '📅 ปฏิทินกิจกรรมชุมชน',
          weight: 'bold',
          color: '#ffffff',
          size: 'sm',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: activity.act_title,
          weight: 'bold',
          size: 'lg',
          wrap: true,
          color: '#0f172a',
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: '🗓 วันที่:',
                  color: '#64748b',
                  size: 'sm',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: thaiDate,
                  wrap: true,
                  color: '#0f172a',
                  size: 'sm',
                  weight: 'bold',
                  flex: 5,
                },
              ],
            },
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: '📍 สถานที่:',
                  color: '#64748b',
                  size: 'sm',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: activity.act_location || 'ไม่ระบุ',
                  wrap: true,
                  color: '#0f172a',
                  size: 'sm',
                  weight: 'bold',
                  flex: 5,
                },
              ],
            },
          ],
        },
        {
          type: 'text',
          text: previewText,
          size: 'xs',
          color: '#64748b',
          wrap: true,
          margin: 'lg',
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: '#0f766e',
          action: {
            type: 'uri',
            label: 'ดูรายละเอียดกิจกรรม',
            uri: targetUri,
          },
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `📅 กิจกรรมชุมชน: ${activity.act_title} (${thaiDate})`,
    contents: bubble,
  };
}

/**
 * Core logic ส่งกิจกรรมไปยัง LINE ลูกบ้าน
 */
async function executeActivityBroadcast(actId, zoneName) {
  if (!process.env.PUBLIC_APP_URL) {
    throwError('ยังไม่ได้ตั้งค่า PUBLIC_APP_URL ใน .env กรุณาตั้งค่าก่อนส่งกิจกรรม', 500);
  }

  const activity = await activityModel.findById(actId);
  if (!activity) throwError('ไม่พบกิจกรรมนี้', 404);

  const lineIds = await broadcastModel.getVillagerLineIds(zoneName);
  if (lineIds.length === 0) {
    const scope = zoneName ? `ในโซน "${zoneName}"` : 'ในระบบเลย';
    throwError(`ยังไม่มีลูกบ้านลงทะเบียน${scope} ไม่สามารถส่งกิจกรรมได้`, 400);
  }

  await lineClient.multicast({
    to: lineIds,
    messages: [buildActivityFlexMessage(activity)],
  });

  return { totalReceived: lineIds.length, zoneName: zoneName || 'ทั้งหมด' };
}

async function broadcastActivity(actId, zoneName, currentUser) {
  if (currentUser.roleName !== 'Admin' && currentUser.roleName !== 'Leader') {
    throwError('ไม่มีสิทธิ์ส่งกิจกรรม', 403);
  }

  return executeActivityBroadcast(actId, zoneName);
}

async function getZones() {
  return broadcastModel.getAllZones();
}

module.exports = {
  broadcastNews,
  getZones,
  executeBroadcast,
  buildActivityFlexMessage,
  executeActivityBroadcast,
  broadcastActivity,
};