const express = require('express');
const controller = require('../controllers/branch.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateCreateBranch,
    validateUpdateBranch,
    validateReorderBranches
} = require('../validators/branch.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', controller.list);
router.post('/', validate(validateCreateBranch), controller.create);
router.patch('/reorder', validate(validateReorderBranches), controller.reorder);
router.put('/:id', validate(validateUpdateBranch), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;