const express = require('express');
const controller = require('../controllers/content.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateUpdateContent } = require('../validators/content.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
  .route('/')
  .get(controller.getContent)
  .put(validate(validateUpdateContent), controller.updateContent)
  .patch(validate(validateUpdateContent), controller.updateContent);

router.post('/reset', controller.resetContent);

module.exports = router;