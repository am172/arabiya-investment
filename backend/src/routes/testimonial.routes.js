const express = require('express');
const controller = require('../controllers/testimonial.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateCreateTestimonial,
    validateUpdateTestimonial
} = require('../validators/testimonial.validator');
const { validateReorder } = require('../validators/common.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
    .route('/')
    .get(controller.getTestimonials)
    .post(validate(validateCreateTestimonial), controller.createTestimonial);

router.patch('/reorder', validate(validateReorder), controller.reorderTestimonials);

router
    .route('/:id')
    .get(controller.getTestimonialById)
    .put(validate(validateUpdateTestimonial), controller.updateTestimonial)
    .patch(validate(validateUpdateTestimonial), controller.updateTestimonial)
    .delete(controller.deleteTestimonial);

router.patch('/:id/toggle-status', controller.toggleTestimonialStatus);

module.exports = router;