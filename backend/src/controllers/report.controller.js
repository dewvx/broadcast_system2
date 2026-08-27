const reportService = require('../services/report.service');

async function getSummary(req, res, next) {
  try {
    const summary = await reportService.getDashboardSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

async function getTopNews(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 5;
    const topNews = await reportService.getTopNews(limit);
    res.json({ success: true, data: topNews });
  } catch (err) {
    next(err);
  }
}

async function getBroadcastHistory(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 10;
    const history = await reportService.getBroadcastHistory(limit);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

async function getNewsViewCount(req, res, next) {
  try {
    const result = await reportService.getNewsViewCount(req.params.newsId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary, getTopNews, getBroadcastHistory, getNewsViewCount };