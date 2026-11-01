const express = require('express');
const controller = require('../controllers/contact.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  validateUpdateContactStatus,
  validateBulkDelete
} = require('../validators/contact.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', controller.getMessages);
router.get('/unread-count', controller.getUnreadCount);
router.patch('/mark-all-read', controller.markAllAsRead);
router.post('/bulk-delete', validate(validateBulkDelete), controller.bulkDeleteMessages);

router.route('/:id').get(controller.getMessageById).delete(controller.deleteMessage);

router.patch('/:id/status', validate(validateUpdateContactStatus), controller.updateMessageStatus);

module.exports = router;