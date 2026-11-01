const express = require('express');
const controller = require('../controllers/stat.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateCreateStat, validateUpdateStat } = require('../validators/stat.validator');
const { validateReorder } = require('../validators/common.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.route('/').get(controller.getStats).post(validate(validateCreateStat), controller.createStat);

router.patch('/reorder', validate(validateReorder), controller.reorderStats);

router
  .route('/:id')
  .get(controller.getStatById)
  .put(validate(validateUpdateStat), controller.updateStat)
  .patch(validate(validateUpdateStat), controller.updateStat)
  .delete(controller.deleteStat);

router.patch('/:id/toggle-status', controller.toggleStatStatus);

module.exports = router;