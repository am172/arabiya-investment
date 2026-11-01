const express = require('express');
const controller = require('../controllers/productRequest.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateRequestStatus,
    validateAdminNote,
    validateBulkIds
} = require('../validators/productRequest.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', controller.list);
router.get('/stats', controller.stats);
router.get('/unread-count', controller.unreadCount);
router.get('/export', controller.exportCsv);
router.post('/bulk-delete', validate(validateBulkIds), controller.bulkRemove);

router.get('/:id', controller.get);
router.patch('/:id/status', validate(validateRequestStatus), controller.updateStatus);
router.patch('/:id/note', validate(validateAdminNote), controller.updateNote);
router.delete('/:id', controller.remove);

module.exports = router;