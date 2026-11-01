const express = require('express');
const controller = require('../controllers/text.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateUpdateTexts } = require('../validators/text.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
    .route('/')
    .get(controller.getTexts)
    .put(validate(validateUpdateTexts), controller.updateTexts);

router.post('/reset', controller.resetTexts);

module.exports = router;