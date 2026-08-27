const { verifyLiffIdToken } = require('../services/liffAuth.service');

function liffAuthMiddleware(options = { optional: false }) {
  return async (req, res, next) => {
    try {
      const idToken =
        req.headers['x-liff-id-token'] ||
        req.body?.idToken ||
        (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
          ? req.headers.authorization.split(' ')[1]
          : null);

      if (!idToken || idToken === 'guest') {
        if (options.optional) {
          req.villager = null;
          return next();
        }
        return res.status(401).json({ success: false, message: 'กรุณาระบุ LIFF ID Token' });
      }

      try {
        const villagerData = await verifyLiffIdToken(idToken);
        req.villager = villagerData;
      } catch (tokenErr) {
        if (options.optional) {
          req.villager = null;
          return next();
        }
        throw tokenErr;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = liffAuthMiddleware;
