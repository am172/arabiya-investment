const express = require('express');
const controller = require('../controllers/certificate.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const { uploadPdf } = require('../middlewares/upload.middleware');
const { sendLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  validateCreateCertificate,
  validateUpdateCertificate,
  validateRevoke,
  validateCertificateSettings
} = require('../validators/certificate.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
  .route('/settings')
  .get(controller.getSettings)
  .put(validate(validateCertificateSettings), controller.updateSettings);

router
  .route('/')
  .get(controller.listCertificates)
  .post(validate(validateCreateCertificate), controller.createCertificate);

router
  .route('/:id')
  .patch(validate(validateUpdateCertificate), controller.updateCertificate)
  .delete(controller.deleteCertificate);

router.patch('/:id/revoke', validate(validateRevoke), controller.revokeCertificate);
router.post('/:id/send-whatsapp', sendLimiter, uploadPdf, controller.sendOnWhatsApp);

module.exports = router;