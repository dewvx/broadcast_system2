const villagerService = require('../services/villager.service');
const activityService = require('../services/activity.service');
const documentService = require('../services/document.service');
const newsPublicService = require('../services/newsPublic.service');

async function checkOrLogin(req, res, next) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ไม่พบ idToken' });
    }

    const result = await villagerService.checkOrLogin(idToken);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const { idToken, firstName, lastName, houseNumber, zoneName } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ไม่พบ idToken' });
    }

    const villager = await villagerService.registerVillager(idToken, {
      firstName,
      lastName,
      houseNumber,
      zoneName,
    });

    res.status(201).json({ success: true, villager });
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const villagers = await villagerService.getAllVillagers();
    res.json({ success: true, data: villagers });
  } catch (err) {
    next(err);
  }
}

async function getActivities(req, res, next) {
  try {
    const activities = await activityService.getAllActivities();
    res.json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
}

async function getActivityDetail(req, res, next) {
  try {
    const activity = await activityService.getActivityById(req.params.id);
    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
}

async function getDocuments(req, res, next) {
  try {
    const docs = await documentService.getAllDocuments();
    res.json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
}

async function getNews(req, res, next) {
  try {
    const news = await newsPublicService.getPublicNewsList();
    res.json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
}

module.exports = { checkOrLogin, register, getAll, getActivities, getActivityDetail, getDocuments, getNews };