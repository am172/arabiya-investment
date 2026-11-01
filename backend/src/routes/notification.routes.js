const express = require('express');
const controller = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { sendLimiter } = require('../middlewares/rateLimiter.middleware');
const {
    validateSubscription,
    validateUnsubscribe,
    validateNotificationSettings
} = require('../validators/notification.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', controller.getStatus);
router.put('/settings', validate(validateNotificationSettings), controller.updateSettings);
router.post('/subscribe', validate(validateSubscription), controller.subscribe);
router.post('/unsubscribe', validate(validateUnsubscribe), controller.unsubscribe);
router.post('/test', sendLimiter, controller.test);

module.exports = router;