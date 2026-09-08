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

async function sendRegistrationOtp(req, res, next) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ไม่พบ idToken' });
    }

    const result = await villagerService.sendRegistrationOtp(idToken);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const { idToken, firstName, lastName, houseNumber, zoneName, pdpaConsent, otpCode } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ไม่พบ idToken' });
    }

    const villager = await villagerService.registerVillager(idToken, {
      firstName,
      lastName,
      houseNumber,
      zoneName,
      pdpaConsent: pdpaConsent === true, // ensure boolean
      otpCode,
    });

    res.status(201).json({ success: true, villager });
  } catch (err) {
    next(err);
  }
}

async function updateSelfProfile(req, res, next) {
  try {
    const { idToken, firstName, lastName, houseNumber, zoneName } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ไม่พบ idToken' });
    }

    const villager = await villagerService.updateSelfProfile(idToken, {
      firstName,
      lastName,
      houseNumber,
      zoneName,
    });

    res.json({ success: true, message: 'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว', villager });
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

async function updateByAdmin(req, res, next) {
  try {
    const villager = await villagerService.updateVillagerByAdmin(req.params.id, req.body);
    res.json({ success: true, message: 'แก้ไขข้อมูลลูกบ้านเรียบร้อยแล้ว', villager });
  } catch (err) {
    next(err);
  }
}

async function removeByAdmin(req, res, next) {
  try {
    await villagerService.deleteVillagerByAdmin(req.params.id);
    res.json({ success: true, message: 'ลบลูกบ้านออกจากระบบเรียบร้อยแล้ว' });
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

module.exports = {
  checkOrLogin,
  sendRegistrationOtp,
  register,
  updateSelfProfile,
  getAll,
  updateByAdmin,
  removeByAdmin,
  getActivities,
  getActivityDetail,
  getDocuments,
  getNews,
};