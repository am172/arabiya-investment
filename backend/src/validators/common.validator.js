const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const checkString = (body, field, options, errors) => {
  const { required = false, nonEmpty = false, min = 0, max = Infinity } = options;
  const value = body[field];

  if (value === undefined || value === null) {
    if (required) errors.push({ field, message: `${field} is required` });
    return;
  }
  if (typeof value !== 'string') {
    errors.push({ field, message: `${field} must be a string` });
    return;
  }

  const length = value.trim().length;
  if ((required || nonEmpty) && length === 0) {
    errors.push({ field, message: `${field} must not be empty` });
  } else if (length > max) {
    errors.push({ field, message: `${field} must not exceed ${max} characters` });
  } else if (length > 0 && length < min) {
    errors.push({ field, message: `${field} must be at least ${min} characters` });
  }
};

const checkNumber = (body, field, options, errors) => {
  const {
    required = false,
    nullable = false,
    integer = false,
    min = -Infinity,
    max = Infinity
  } = options;
  const value = body[field];

  if (value === undefined) {
    if (required) errors.push({ field, message: `${field} is required` });
    return;
  }
  if (value === null) {
    if (!nullable) errors.push({ field, message: `${field} must be a number` });
    return;
  }

  const isNumeric =
    typeof value === 'number' || (typeof value === 'string' && value.trim() !== '');
  const number = isNumeric ? Number(value) : NaN;

  const outOfRange = number < min || number > max;
  if (!Number.isFinite(number) || (integer && !Number.isInteger(number)) || outOfRange) {
    let range = '';
    if (min > -Infinity && max < Infinity) range = ` between ${min} and ${max}`;
    else if (min > -Infinity) range = ` of at least ${min}`;
    else if (max < Infinity) range = ` of at most ${max}`;
    errors.push({ field, message: `${field} must be ${integer ? 'an integer' : 'a number'}${range}` });
  }
};

const checkBoolean = (body, field, errors) => {
  if (body[field] !== undefined && typeof body[field] !== 'boolean') {
    errors.push({ field, message: `${field} must be a boolean` });
  }
};

const checkEnum = (body, field, values, errors, required = false) => {
  const value = body[field];
  if (value === undefined) {
    if (required) errors.push({ field, message: `${field} is required` });
    return;
  }
  if (!values.includes(value)) {
    errors.push({ field, message: `${field} must be one of: ${values.join(', ')}` });
  }
};

const checkUrl = (body, field, options, errors) => {
  const { required = false, allowEmpty = true, allowRelative = false, max = 500 } = options;
  const value = body[field];

  if (value === undefined || value === null) {
    if (required) errors.push({ field, message: `${field} is required` });
    return;
  }
  if (typeof value !== 'string') {
    errors.push({ field, message: `${field} must be a string` });
    return;
  }

  const trimmed = value.trim();
  if (trimmed === '') {
    if (required || !allowEmpty) errors.push({ field, message: `${field} must not be empty` });
    return;
  }
  if (trimmed.length > max) {
    errors.push({ field, message: `${field} must not exceed ${max} characters` });
    return;
  }
  if (allowRelative && trimmed.startsWith('/') && !trimmed.startsWith('//')) return;
  if (!isHttpUrl(trimmed)) {
    errors.push({ field, message: `${field} must be a valid http(s) URL` });
  }
};

const checkEmail = (body, field, options, errors) => {
  const { required = false, allowEmpty = true } = options;
  const value = body[field];

  if (value === undefined || value === null) {
    if (required) errors.push({ field, message: `${field} is required` });
    return;
  }
  if (typeof value !== 'string') {
    errors.push({ field, message: `${field} must be a string` });
    return;
  }

  const trimmed = value.trim();
  if (trimmed === '') {
    if (required || !allowEmpty) errors.push({ field, message: `${field} must not be empty` });
    return;
  }
  if (!EMAIL_REGEX.test(trimmed) || trimmed.length > 254) {
    errors.push({ field, message: `${field} must be a valid email address` });
  }
};

const checkStringArray = (body, field, options, errors) => {
  const { maxItems = 50, maxLength = 200 } = options;
  const value = body[field];

  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push({ field, message: `${field} must be an array` });
    return;
  }
  if (value.length > maxItems) {
    errors.push({ field, message: `${field} must not contain more than ${maxItems} items` });
    return;
  }
  value.forEach((item, index) => {
    if (typeof item !== 'string' || item.trim().length === 0 || item.length > maxLength) {
      errors.push({
        field: `${field}[${index}]`,
        message: `Each item must be a non-empty string up to ${maxLength} characters`
      });
    }
  });
};

const validateNested = (body, field, errors, run) => {
  const value = body[field];
  if (value === undefined) return;
  if (!isPlainObject(value)) {
    errors.push({ field, message: `${field} must be an object` });
    return;
  }
  if (Object.keys(value).length === 0) {
    errors.push({ field, message: `${field} must not be empty` });
    return;
  }
  const nestedErrors = [];
  run(value, nestedErrors);
  nestedErrors.forEach((item) => {
    errors.push({ field: `${field}.${item.field}`, message: item.message });
  });
};

const checkAsset = (body, field, options, errors) => {
  const { required = false } = options;
  if (body[field] === undefined || body[field] === null) {
    if (required) errors.push({ field, message: `${field} is required` });
    return;
  }
  validateNested(body, field, errors, (value, nestedErrors) => {
    checkUrl(value, 'url', { required, allowEmpty: !required }, nestedErrors);
    checkString(value, 'publicId', { max: 300 }, nestedErrors);
  });
};

const checkHasFields = (body, fields, errors) => {
  const hasAny = fields.some((field) => body[field] !== undefined);
  if (!hasAny) errors.push({ field: 'body', message: 'No valid fields provided' });
};

const validateReorder = (body) => {
  const errors = [];
  const items = body.items;

  if (!Array.isArray(items) || items.length === 0 || items.length > 500) {
    errors.push({ field: 'items', message: 'items must be an array of 1 to 500 entries' });
    return errors;
  }

  items.forEach((item, index) => {
    if (!isPlainObject(item) || typeof item.id !== 'string' || !OBJECT_ID_REGEX.test(item.id)) {
      errors.push({ field: `items[${index}].id`, message: 'A valid id is required' });
    }
    if (!isPlainObject(item) || typeof item.order !== 'number' || !Number.isFinite(item.order)) {
      errors.push({ field: `items[${index}].order`, message: 'order must be a number' });
    }
  });

  return errors;
};

module.exports = {
  HEX_COLOR_REGEX,
  isPlainObject,
  isHttpUrl,
  checkString,
  checkNumber,
  checkBoolean,
  checkEnum,
  checkUrl,
  checkEmail,
  checkStringArray,
  checkAsset,
  checkHasFields,
  validateNested,
  validateReorder
};