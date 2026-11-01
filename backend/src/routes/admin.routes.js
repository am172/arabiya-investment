const express = require('express');
const controller = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  validateCreateAdmin,
  validateUpdateAdmin,
  validateResetPassword
} = require('../validators/admin.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.SUPER_ADMIN));

router
  .route('/')
  .get(controller.getAdmins)
  .post(validate(validateCreateAdmin), controller.createAdmin);

router
  .route('/:id')
  .get(controller.getAdminById)
  .put(validate(validateUpdateAdmin), controller.updateAdmin)
  .patch(validate(validateUpdateAdmin), controller.updateAdmin)
  .delete(controller.deleteAdmin);

router.patch('/:id/toggle-status', controller.toggleAdminStatus);
router.patch('/:id/reset-password', validate(validateResetPassword), controller.resetAdminPassword);

module.exports = router;