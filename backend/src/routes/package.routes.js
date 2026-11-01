const express = require('express');
const controller = require('../controllers/package.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  validateCreatePackage,
  validateUpdatePackage
} = require('../validators/package.validator');
const { validateReorder } = require('../validators/common.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
  .route('/')
  .get(controller.getPackages)
  .post(validate(validateCreatePackage), controller.createPackage);

router.patch('/reorder', validate(validateReorder), controller.reorderPackages);

router
  .route('/:id')
  .get(controller.getPackageById)
  .put(validate(validateUpdatePackage), controller.updatePackage)
  .patch(validate(validateUpdatePackage), controller.updatePackage)
  .delete(controller.deletePackage);

router.patch('/:id/toggle-status', controller.togglePackageStatus);
router.patch('/:id/set-popular', controller.setPopularPackage);

module.exports = router;