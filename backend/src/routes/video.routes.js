const express = require('express');
const controller = require('../controllers/video.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateCreateVideo, validateUpdateVideo } = require('../validators/video.validator');
const { validateReorder } = require('../validators/common.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
  .route('/')
  .get(controller.getVideos)
  .post(validate(validateCreateVideo), controller.createVideo);

router.patch('/reorder', validate(validateReorder), controller.reorderVideos);

router
  .route('/:id')
  .get(controller.getVideoById)
  .put(validate(validateUpdateVideo), controller.updateVideo)
  .patch(validate(validateUpdateVideo), controller.updateVideo)
  .delete(controller.deleteVideo);

router.patch('/:id/toggle-status', controller.toggleVideoStatus);
router.patch('/:id/toggle-featured', controller.toggleVideoFeatured);

module.exports = router;