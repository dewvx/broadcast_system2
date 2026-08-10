const villagerService = require('../services/villager.service');

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

module.exports = { checkOrLogin, register };