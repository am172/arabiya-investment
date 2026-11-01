const express = require('express');
const controller = require('../controllers/whatsapp.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateConnect,
    validateSettings,
    validatePreview
} = require('../validators/whatsapp.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/status', controller.getStatus);
router.post('/connect', validate(validateConnect), controller.connect);
router.post('/disconnect', controller.disconnect);

router
    .route('/settings')
    .get(controller.getSettings)
    .put(validate(validateSettings), controller.updateSettings);

router.post('/preview', validate(validatePreview), controller.preview);

router.get('/chats', controller.listChats);
router.patch('/chats/:id/resume', controller.resumeChat);
router.delete('/chats/:id', controller.deleteChat);

module.exports = router;