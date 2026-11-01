const {
  HEX_COLOR_REGEX,
  checkEnum,
  checkHasFields,
  validateNested
} = require('./common.validator');

const FIELDS = ['colors', 'darkColors', 'fonts', 'borderRadius', 'mode'];
const COLOR_KEYS = [
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'accent',
  'background',
  'surface',
  'text',
  'textMuted',
  'border',
  'success',
  'warning',
  'error'
];
const FONT_KEYS = ['heading', 'body'];
const RADIUS_VALUES = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
const MODES = ['light', 'dark'];
const FONT_REGEX = /^[A-Za-z0-9][A-Za-z0-9 -]{0,59}$/;

const checkColors = (value, nestedErrors) => {
  Object.keys(value).forEach((key) => {
    if (!COLOR_KEYS.includes(key)) {
      nestedErrors.push({ field: key, message: `Unknown color key: ${key}` });
    } else if (typeof value[key] !== 'string' || !HEX_COLOR_REGEX.test(value[key])) {
      nestedErrors.push({ field: key, message: `${key} must be a valid hex color` });
    }
  });
};

const validateUpdateTheme = (body) => {
  const errors = [];

  checkHasFields(body, FIELDS, errors);

  validateNested(body, 'colors', errors, checkColors);
  validateNested(body, 'darkColors', errors, checkColors);

  validateNested(body, 'fonts', errors, (value, nestedErrors) => {
    Object.keys(value).forEach((key) => {
      if (!FONT_KEYS.includes(key)) {
        nestedErrors.push({ field: key, message: `Unknown font key: ${key}` });
      } else if (typeof value[key] !== 'string' || !FONT_REGEX.test(value[key].trim())) {
        nestedErrors.push({
          field: key,
          message: `${key} must contain only letters, numbers, spaces and hyphens (max 60)`
        });
      }
    });
  });

  checkEnum(body, 'borderRadius', RADIUS_VALUES, errors);
  checkEnum(body, 'mode', MODES, errors);

  return errors;
};

module.exports = { validateUpdateTheme };