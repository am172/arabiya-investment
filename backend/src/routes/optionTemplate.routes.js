const express = require('express');
const controller = require('../controllers/optionTemplate.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateCreateTemplate, validateUpdateTemplate } = require('../validators/option.validator');
const { validateFromNode } = require('../validators/catalog.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', controller.list);
router.post('/', validate(validateCreateTemplate), controller.create);
router.post('/from-node', validate(validateFromNode), controller.fromNode);
router.get('/:id', controller.get);
router.put('/:id', validate(validateUpdateTemplate), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;