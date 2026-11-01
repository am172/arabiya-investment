const express = require('express');
const controller = require('../controllers/teacher.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  validateCreateTeacher,
  validateUpdateTeacher
} = require('../validators/teacher.validator');
const { validateReorder } = require('../validators/common.validator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.param('id', validateObjectId);
router.use(protect, restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
  .route('/')
  .get(controller.getTeachers)
  .post(validate(validateCreateTeacher), controller.createTeacher);

router.patch('/reorder', validate(validateReorder), controller.reorderTeachers);

router
  .route('/:id')
  .get(controller.getTeacherById)
  .put(validate(validateUpdateTeacher), controller.updateTeacher)
  .patch(validate(validateUpdateTeacher), controller.updateTeacher)
  .delete(controller.deleteTeacher);

router.patch('/:id/toggle-status', controller.toggleTeacherStatus);

module.exports = router;