const {
  checkString,
  checkEmail,
  checkUrl,
  checkStringArray,
  checkAsset,
  checkHasFields,
  validateNested
} = require('./common.validator');

const FIELDS = ['siteName', 'tagline', 'logo', 'favicon', 'contact', 'socialLinks', 'seo'];
const SOCIAL_FIELDS = ['facebook', 'instagram', 'youtube', 'tiktok', 'twitter'];

const validateUpdateSettings = (body) => {
  const errors = [];

  checkHasFields(body, FIELDS, errors);

  checkString(body, 'siteName', { nonEmpty: true, max: 100 }, errors);
  checkString(body, 'tagline', { max: 200 }, errors);
  checkAsset(body, 'logo', { required: false }, errors);
  checkAsset(body, 'favicon', { required: false }, errors);

  validateNested(body, 'contact', errors, (value, nestedErrors) => {
    checkEmail(value, 'email', {}, nestedErrors);
    checkString(value, 'phone', { max: 30 }, nestedErrors);
    checkString(value, 'whatsapp', { max: 30 }, nestedErrors);
    checkString(value, 'address', { max: 300 }, nestedErrors);
  });

  validateNested(body, 'socialLinks', errors, (value, nestedErrors) => {
    SOCIAL_FIELDS.forEach((field) => checkUrl(value, field, {}, nestedErrors));
  });

  validateNested(body, 'seo', errors, (value, nestedErrors) => {
    checkString(value, 'title', { max: 120 }, nestedErrors);
    checkString(value, 'description', { max: 300 }, nestedErrors);
    checkStringArray(value, 'keywords', { maxItems: 30, maxLength: 60 }, nestedErrors);
    if (value.googleVerification !== undefined && value.googleVerification !== '') {
      if (
        typeof value.googleVerification !== 'string' ||
        !/^[A-Za-z0-9_-]{20,120}$/.test(value.googleVerification)
      ) {
        nestedErrors.push({ field: 'googleVerification', message: 'Paste only the Google verification code' });
      }
    }
  });

  return errors;
};

module.exports = { validateUpdateSettings };