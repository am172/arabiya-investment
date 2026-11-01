const express = require('express');
const controller = require('../controllers/cloudinary.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { sendLimiter } = require('../middlewares/rateLimiter.middleware');
const { validateCloudinary } = require('../validators/cloudinary.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
    .route('/')
    .get(controller.getStatus)
    .put(sendLimiter, validate(validateCloudinary), controller.save)
    .delete(controller.remove);

router.post('/test', sendLimiter, validate(validateCloudinary), controller.test);

module.exports = router;