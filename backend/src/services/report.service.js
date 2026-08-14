const reportModel = require('../models/report.model');
const viewModel = require('../models/view.model');
const newsModel = require('../models/news.model');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

/**
 * สรุปภาพรวมทั้งหมดสำหรับหน้า Dashboard
 * ยิงหลาย query พร้อมกันด้วย Promise.all แทนที่จะ await ทีละอัน - เร็วกว่าเพราะ query ไม่ได้ต้องรอกันเอง
 */
async function getDashboardSummary() {
  const [newsByStatus, totalVillagers, totalBroadcasts, totalViews] = await Promise.all([
    reportModel.countNewsByStatus(),
    reportModel.countTotalVillagers(),
    reportModel.countTotalBroadcasts(),
    reportModel.sumTotalViews(),
  ]);

  return {
    news: {
      pending: newsByStatus.Pending,
      approved: newsByStatus.Approved,
      rejected: newsByStatus.Rejected,
      total: newsByStatus.Pending + newsByStatus.Approved + newsByStatus.Rejected,
    },
    totalVillagers,
    totalBroadcasts,
    totalViews,
  };
}

async function getTopNews(limit = 5) {
  return reportModel.getTopViewedNews(limit);
}

async function getBroadcastHistory(limit = 10) {
  return reportModel.getRecentBroadcasts(limit);
}

async function getNewsViewCount(newsId) {
  const news = await newsModel.findById(newsId);
  if (!news) throwError('ไม่พบข่าวนี้', 404);

  const viewCount = await viewModel.countViewsByNewsId(newsId);
  return { newsId: news.news_id, newsTitle: news.news_title, viewCount };
}

module.exports = { getDashboardSummary, getTopNews, getBroadcastHistory, getNewsViewCount };