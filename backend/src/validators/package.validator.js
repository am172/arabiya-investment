const {
  checkString,
  checkNumber,
  checkBoolean,
  checkEnum,
  checkUrl,
  checkStringArray,
  checkHasFields
} = require('./common.validator');

const FIELDS = [
  'name',
  'description',
  'price',
  'discountPrice',
  'currency',
  'prices',
  'billingPeriod',
  'sessionsPerMonth',
  'sessionDuration',
  'features',
  'badge',
  'isPopular',
  'ctaLabel',
  'ctaLink',
  'order',
  'isActive'
];
const BILLING_PERIODS = ['weekly', 'monthly', 'quarterly', 'yearly', 'one-time'];
const CURRENCY_REGEX = /^[A-Za-z]{3}$/;

const checkPrices = (body, errors) => {
  const value = body.prices;
  if (value === undefined) return;

  if (!Array.isArray(value) || value.length > 10) {
    errors.push({ field: 'prices', message: 'prices must be an array of up to 10 items' });
    return;
  }

  const seen = new Set();
  value.forEach((item, index) => {
    const base = `prices[${index}]`;
    if (!item || typeof item !== 'object') {
      errors.push({ field: base, message: 'Invalid price entry' });
      return;
    }
    const code = String(item.currency || '').toUpperCase();
    if (!/^[A-Z]{3}$/.test(code) || seen.has(code)) {
      errors.push({ field: `${base}.currency`, message: 'Invalid or duplicate currency' });
    }
    seen.add(code);
    const price = Number(item.price);
    if (!Number.isFinite(price) || price < 0) {
      errors.push({ field: `${base}.price`, message: 'Enter a valid price' });
    }
    if (item.discountPrice !== null && item.discountPrice !== undefined && item.discountPrice !== '') {
      const discount = Number(item.discountPrice);
      if (!Number.isFinite(discount) || discount < 0 || discount >= price) {
        errors.push({ field: `${base}.discountPrice`, message: 'Discount must be lower than the price' });
      }
    }
  });
};

const build = (isCreate) => (body) => {
  const errors = [];
  const base = { required: isCreate, nonEmpty: true };

  if (!isCreate) checkHasFields(body, FIELDS, errors);

  checkString(body, 'name', { ...base, max: 100 }, errors);
  checkString(body, 'description', { max: 500 }, errors);
  checkNumber(body, 'price', { required: isCreate, min: 0 }, errors);
  checkNumber(body, 'discountPrice', { min: 0, nullable: true }, errors);

  if (
    body.price !== undefined &&
    body.discountPrice !== undefined &&
    body.discountPrice !== null &&
    Number(body.discountPrice) >= Number(body.price)
  ) {
    errors.push({
      field: 'discountPrice',
      message: 'discountPrice must be lower than the regular price'
    });
  }

  if (body.currency !== undefined && !CURRENCY_REGEX.test(String(body.currency).trim())) {
    errors.push({ field: 'currency', message: 'currency must be a 3-letter ISO code' });
  }

  checkEnum(body, 'billingPeriod', BILLING_PERIODS, errors);
  checkNumber(body, 'sessionsPerMonth', { min: 0, integer: true }, errors);
  checkNumber(body, 'sessionDuration', { min: 0, max: 480, integer: true }, errors);
  checkStringArray(body, 'features', { maxItems: 30, maxLength: 200 }, errors);
  checkString(body, 'badge', { max: 40 }, errors);
  checkBoolean(body, 'isPopular', errors);
  checkString(body, 'ctaLabel', { max: 60 }, errors);
  checkUrl(body, 'ctaLink', { allowRelative: true }, errors);
  checkNumber(body, 'order', {}, errors);
  checkBoolean(body, 'isActive', errors);

  checkPrices(body, errors);
  return errors;
};

module.exports = {
  validateCreatePackage: build(true),
  validateUpdatePackage: build(false)
};