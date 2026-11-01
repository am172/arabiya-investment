const express = require('express');
const controller = require('../controllers/currency.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateUpdateCurrency } = require('../validators/currency.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
    .route('/')
    .get(controller.getCurrencySettings)
    .put(validate(validateUpdateCurrency), controller.updateCurrencySettings);

router.post('/refresh', controller.refreshCurrencyRates);

module.exports = router;