const {
  isPlainObject,
  checkString,
  checkNumber,
  checkBoolean,
  checkEnum,
  checkStringArray,
  checkHasFields
} = require('./common.validator');

const SETTINGS_FIELDS = [
  'enabled',
  'provider',
  'instructions',
  'fallbackMessage',
  'handoffKeywords',
  'handoffMessage',
  'maxRepliesPerHour'
];

const validateConnect = (body) => {
  const errors = [];
  checkEnum(body, 'mode', ['qr', 'pairing'], errors, true);
  if (body.mode === 'pairing') {
    const digits = String(body.phone || '').replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      errors.push({ field: 'phone', message: 'Enter the full number with the country code' });
    }
  }
  return errors;
};

const validateSettings = (body) => {
  const errors = [];
  checkHasFields(body, SETTINGS_FIELDS, errors);
  checkBoolean(body, 'enabled', errors);
  checkEnum(body, 'provider', ['groq', 'gemini'], errors);
  checkString(body, 'instructions', { max: 1500 }, errors);
  checkString(body, 'fallbackMessage', { nonEmpty: true, max: 500 }, errors);
  checkString(body, 'handoffMessage', { nonEmpty: true, max: 500 }, errors);
  checkStringArray(body, 'handoffKeywords', { maxItems: 20, maxLength: 40 }, errors);
  checkNumber(body, 'maxRepliesPerHour', { integer: true, min: 1, max: 100 }, errors);
  return errors;
};

const validatePreview = (body) => {
  const errors = [];
  checkString(body, 'text', { required: true, nonEmpty: true, max: 1000 }, errors);
  if (body.history !== undefined) {
    if (!Array.isArray(body.history) || body.history.length > 12) {
      errors.push({ field: 'history', message: 'history must be an array of up to 12 items' });
    } else if (body.history.some((item) => !isPlainObject(item) || typeof item.text !== 'string')) {
      errors.push({ field: 'history', message: 'Invalid history entry' });
    }
  }
  return errors;
};

module.exports = { validateConnect, validateSettings, validatePreview };