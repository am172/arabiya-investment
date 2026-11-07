const express = require('express');
const controller = require('../controllers/subsidiary.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateCreateSubsidiary,
    validateUpdateSubsidiary
} = require('../validators/subsidiary.validator');
const { validateReorder } = require('../validators/common.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
    .route('/')
    .get(controller.getSubsidiaries)
    .post(validate(validateCreateSubsidiary), controller.createSubsidiary);

router.patch('/reorder', validate(validateReorder), controller.reorderSubsidiaries);

router
    .route('/:id')
    .get(controller.getSubsidiaryById)
    .put(validate(validateUpdateSubsidiary), controller.updateSubsidiary)
    .patch(validate(validateUpdateSubsidiary), controller.updateSubsidiary)
    .delete(controller.deleteSubsidiary);

router.patch('/:id/toggle-status', controller.toggleSubsidiaryStatus);

module.exports = router;