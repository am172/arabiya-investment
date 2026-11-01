const express = require('express');
const controller = require('../controllers/catalog.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateCreateNode,
    validateUpdateNode,
    validateFlags,
    validateMove,
    validateReorder,
    validateDuplicate,
    validateApplyTemplate,
    validateCopyOptions,
    validateBulk
} = require('../validators/catalog.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', controller.list);
router.get('/tree', controller.tree);
router.post('/', validate(validateCreateNode), controller.create);
router.patch('/reorder', validate(validateReorder), controller.reorder);
router.post('/bulk', validate(validateBulk), controller.bulk);

router.get('/:id', controller.get);
router.put('/:id', validate(validateUpdateNode), controller.update);
router.patch('/:id/flags', validate(validateFlags), controller.setFlags);
router.patch('/:id/move', validate(validateMove), controller.move);
router.post('/:id/duplicate', validate(validateDuplicate), controller.duplicate);
router.post('/:id/apply-template', validate(validateApplyTemplate), controller.applyTemplate);
router.post('/:id/copy-options', validate(validateCopyOptions), controller.copyOptions);
router.delete('/:id', controller.remove);

module.exports = router;