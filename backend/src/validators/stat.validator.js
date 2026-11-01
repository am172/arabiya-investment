const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const checkOptionalString = (body, field, max, errors) => {
  if (body[field] !== undefined && (typeof body[field] !== 'string' || body[field].length > max)) {
    errors.push({ field, message: `${field} must be a string up to ${max} characters` });
  }
};

const checkCommon = (body, errors) => {
  checkOptionalString(body, 'prefix', 10, errors);
  checkOptionalString(body, 'suffix', 10, errors);
  checkOptionalString(body, 'icon', 60, errors);
  checkOptionalString(body, 'description', 200, errors);
  if (body.order !== undefined && !Number.isFinite(Number(body.order))) {
    errors.push({ field: 'order', message: 'Order must be a number' });
  }
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
    errors.push({ field: 'isActive', message: 'isActive must be a boolean' });
  }
};

const validateCreateStat = (body) => {
  const errors = [];
  if (!isNonEmptyString(body.label) || body.label.trim().length > 100) {
    errors.push({ field: 'label', message: 'Label is required (max 100 characters)' });
  }
  if (body.value === undefined || !Number.isFinite(Number(body.value)) || Number(body.value) < 0) {
    errors.push({ field: 'value', message: 'Value must be a non-negative number' });
  }
  checkCommon(body, errors);
  return errors;
};

const validateUpdateStat = (body) => {
  const errors = [];
  if (body.label !== undefined && (!isNonEmptyString(body.label) || body.label.trim().length > 100)) {
    errors.push({ field: 'label', message: 'Label must be between 1 and 100 characters' });
  }
  if (body.value !== undefined && (!Number.isFinite(Number(body.value)) || Number(body.value) < 0)) {
    errors.push({ field: 'value', message: 'Value must be a non-negative number' });
  }
  checkCommon(body, errors);
  return errors;
};

module.exports = { validateCreateStat, validateUpdateStat };