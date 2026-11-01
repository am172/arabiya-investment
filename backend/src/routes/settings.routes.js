const express = require('express');
const controller = require('../controllers/settings.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateUpdateSettings } = require('../validators/settings.validator');
const { validateUpdateTheme } = require('../validators/theme.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
  .route('/')
  .get(controller.getSettings)
  .put(validate(validateUpdateSettings), controller.updateSettings)
  .patch(validate(validateUpdateSettings), controller.updateSettings);

router
  .route('/theme')
  .put(validate(validateUpdateTheme), controller.updateTheme)
  .patch(validate(validateUpdateTheme), controller.updateTheme);

router.post('/theme/reset', controller.resetTheme);

module.exports = router;