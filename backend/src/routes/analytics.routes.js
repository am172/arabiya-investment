const express = require('express');
const controller = require('../controllers/analytics.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const parseBeacon = require('../middlewares/beacon.middleware');
const { trackLimiter } = require('../middlewares/rateLimiter.middleware');
const { validateTrack } = require('../validators/analytics.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.post('/track', trackLimiter, ...parseBeacon, validate(validateTrack), controller.track);

router.get('/', protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.getAnalytics);

module.exports = router;