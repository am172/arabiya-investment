const {
  checkString,
  checkNumber,
  checkBoolean,
  checkAsset,
  checkHasFields
} = require('./common.validator');

const FIELDS = ['name', 'role', 'content', 'avatar', 'rating', 'order', 'isActive'];

const build = (isCreate) => (body) => {
  const errors = [];

  if (!isCreate) checkHasFields(body, FIELDS, errors);

  checkString(body, 'name', { required: isCreate, nonEmpty: true, max: 100 }, errors);
  checkString(body, 'role', { max: 80 }, errors);
  checkString(body, 'content', { required: isCreate, nonEmpty: true, min: 10, max: 600 }, errors);
  checkNumber(body, 'rating', { required: isCreate, integer: true, min: 1, max: 5 }, errors);
  checkAsset(body, 'avatar', { required: false }, errors);
  checkNumber(body, 'order', {}, errors);
  checkBoolean(body, 'isActive', errors);

  return errors;
};

module.exports = {
  validateCreateTestimonial: build(true),
  validateUpdateTestimonial: build(false)
};