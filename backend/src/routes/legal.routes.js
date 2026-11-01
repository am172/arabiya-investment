const express = require('express');
const controller = require('../controllers/legal.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateUpdateLegal } = require('../validators/legal.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
  .route('/:slug')
  .get(controller.getLegal)
  .put(validate(validateUpdateLegal), controller.updateLegal)
  .patch(validate(validateUpdateLegal), controller.updateLegal);

router.post('/:slug/reset', controller.resetLegal);

module.exports = router;