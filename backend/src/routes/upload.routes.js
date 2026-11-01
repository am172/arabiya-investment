const express = require('express');
const controller = require('../controllers/upload.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const { uploadImage, uploadVideo } = require('../middlewares/upload.middleware');
const { uploadDocument: documentMiddleware } = require('../middlewares/upload.middleware');
const { uploadDocument: documentHandler } = require('../controllers/upload.controller');

const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.post('/image', uploadImage, controller.uploadImage);
router.post('/video', uploadVideo, controller.uploadVideo);
router.delete('/', controller.deleteAsset);
router.post('/document', documentMiddleware, documentHandler);

module.exports = router;