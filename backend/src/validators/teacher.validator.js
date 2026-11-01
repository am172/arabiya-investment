const {
  checkString,
  checkNumber,
  checkBoolean,
  checkUrl,
  checkStringArray,
  checkAsset,
  checkHasFields,
  validateNested
} = require('./common.validator');

const FIELDS = [
  'name',
  'title',
  'bio',
  'image',
  'subjects',
  'experienceYears',
  'rating',
  'studentsCount',
  'socialLinks',
  'order',
  'isActive'
];
const SOCIAL_FIELDS = ['facebook', 'instagram', 'linkedin'];

const build = (isCreate) => (body) => {
  const errors = [];
  const base = { required: isCreate, nonEmpty: true };

  if (!isCreate) checkHasFields(body, FIELDS, errors);

  checkString(body, 'name', { ...base, max: 100 }, errors);
  checkString(body, 'title', { ...base, max: 120 }, errors);
  checkString(body, 'bio', { max: 1000 }, errors);
  checkAsset(body, 'image', { required: isCreate }, errors);
  checkStringArray(body, 'subjects', { maxItems: 20, maxLength: 60 }, errors);
  checkNumber(body, 'experienceYears', { min: 0, max: 80 }, errors);
  checkNumber(body, 'rating', { min: 0, max: 5 }, errors);
  checkNumber(body, 'studentsCount', { min: 0, integer: true }, errors);
  validateNested(body, 'socialLinks', errors, (value, nestedErrors) => {
    SOCIAL_FIELDS.forEach((field) => checkUrl(value, field, {}, nestedErrors));
  });
  checkNumber(body, 'order', {}, errors);
  checkBoolean(body, 'isActive', errors);

  return errors;
};

module.exports = {
  validateCreateTeacher: build(true),
  validateUpdateTeacher: build(false)
};