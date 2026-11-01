const express = require('express');
const controller = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', authLimiter, validate(validateLogin), controller.login);

router.use(protect);

router.get('/me', controller.getMe);
router.post('/logout', controller.logout);
router.patch('/profile', validate(validateUpdateProfile), controller.updateProfile);
router.patch(
  '/change-password',
  authLimiter,
  validate(validateChangePassword),
  controller.changePassword
);

module.exports = router;