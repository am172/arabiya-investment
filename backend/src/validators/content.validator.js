const {
  isPlainObject,
  isHttpUrl,
  checkString,
  checkStringArray,
  checkNumber,
  checkEnum,
  checkAsset,
  checkHasFields,
  validateNested
} = require('./common.validator');

const HERO_VARIANTS = require('../constants/heroVariants');
const HOME_SECTIONS = require('../constants/homeSections');
const SECTION_VARIANTS = require('../constants/sectionVariants');
const SLIDER = require('../constants/heroSlider');

const FIELDS = ['hero', 'sections', 'story', 'features', 'steps', 'subjects', 'faqs'];
const ICON = /^[a-z0-9-]{1,30}$/;

const isSafeHref = (value) => {
  if (value.startsWith('//')) return false;
  if (value.startsWith('/') || value.startsWith('#')) return true;
  return isHttpUrl(value);
};

const checkBoolean = (item, field, errors) => {
  if (item[field] !== undefined && typeof item[field] !== 'boolean') {
    errors.push({ field, message: `${field} must be a boolean` });
  }
};

const checkCta = (parent, field, errors) => {
  validateNested(parent, field, errors, (cta, nested) => {
    checkString(cta, 'label', { max: 40 }, nested);
    checkString(cta, 'href', { max: 300 }, nested);
    const href = typeof cta.href === 'string' ? cta.href.trim() : '';
    if (href && !isSafeHref(href)) {
      nested.push({ field: 'href', message: 'href must be a /path, a #section or an http(s) URL' });
    }
  });
};

const checkIcon = (item, errors) => {
  if (item.icon !== undefined && (typeof item.icon !== 'string' || !ICON.test(item.icon))) {
    errors.push({ field: 'icon', message: 'icon is invalid' });
  }
};

const checkList = (body, field, max, run, errors) => {
  const value = body[field];
  if (value === undefined) return;

  if (!Array.isArray(value)) {
    errors.push({ field, message: `${field} must be an array` });
    return;
  }
  if (value.length > max) {
    errors.push({ field, message: `${field} must not contain more than ${max} items` });
    return;
  }

  value.forEach((item, index) => {
    if (!isPlainObject(item)) {
      errors.push({ field: `${field}[${index}]`, message: 'Each entry must be an object' });
      return;
    }
    const nested = [];
    run(item, nested);
    nested.forEach((entry) => {
      errors.push({ field: `${field}[${index}].${entry.field}`, message: entry.message });
    });
  });
};

const iconTitleText = (item, nested) => {
  checkIcon(item, nested);
  checkString(item, 'title', { required: true, nonEmpty: true, max: 80 }, nested);
  checkString(item, 'text', { required: true, nonEmpty: true, max: 300 }, nested);
};

const iconText = (item, nested) => {
  checkIcon(item, nested);
  checkString(item, 'text', { required: true, nonEmpty: true, max: 40 }, nested);
};

const slideRule = (item, nested) => {
  checkBoolean(item, 'isActive', nested);
  checkString(item, 'company', { max: 80 }, nested);
  checkString(item, 'eyebrow', { max: 80 }, nested);
  checkString(item, 'title', { required: true, nonEmpty: true, max: 160 }, nested);
  checkString(item, 'description', { max: 500 }, nested);
  checkAsset(item, 'logo', { required: false }, nested);
  checkAsset(item, 'image', { required: false }, nested);
  checkCta(item, 'primaryCta', nested);
  checkCta(item, 'secondaryCta', nested);
};

const checkSlider = (hero, errors) => {
  validateNested(hero, 'slider', errors, (slider, nested) => {
    checkBoolean(slider, 'autoplay', nested);
    checkBoolean(slider, 'showArrows', nested);
    checkBoolean(slider, 'showDots', nested);
    checkNumber(slider, 'interval', { integer: true, min: SLIDER.MIN_INTERVAL, max: SLIDER.MAX_INTERVAL }, nested);
    checkEnum(slider, 'effect', SLIDER.EFFECTS, nested);
  });
};

const checkSections = (body, errors) => {
  const value = body.sections;
  if (value === undefined) return;

  if (!Array.isArray(value) || value.length > HOME_SECTIONS.length) {
    errors.push({ field: 'sections', message: 'sections must be an array of known sections' });
    return;
  }

  const seen = new Set();
  value.forEach((item, index) => {
    if (!isPlainObject(item) || !HOME_SECTIONS.includes(item.key)) {
      errors.push({ field: `sections[${index}].key`, message: 'Unknown section' });
      return;
    }
    if (seen.has(item.key)) {
      errors.push({ field: `sections[${index}].key`, message: 'Duplicate section' });
    }
    seen.add(item.key);
    if (typeof item.enabled !== 'boolean') {
      errors.push({ field: `sections[${index}].enabled`, message: 'enabled must be a boolean' });
    }
    if (item.variant !== undefined && item.variant !== '') {
      const allowed = SECTION_VARIANTS[item.key];
      if (!allowed || !allowed.includes(item.variant)) {
        errors.push({ field: `sections[${index}].variant`, message: 'Unknown layout for this section' });
      }
    }
  });
};

const validateUpdateContent = (body) => {
  const errors = [];

  checkHasFields(body, FIELDS, errors);
  checkSections(body, errors);

  validateNested(body, 'hero', errors, (value, nested) => {
    checkEnum(value, 'variant', HERO_VARIANTS, nested);
    checkString(value, 'eyebrow', { max: 80 }, nested);
    checkString(value, 'title', { nonEmpty: true, max: 160 }, nested);
    checkString(value, 'description', { nonEmpty: true, max: 500 }, nested);
    checkAsset(value, 'image', { required: false }, nested);
    checkAsset(value, 'bannerImage', { required: false }, nested);
    checkNumber(value, 'bannerOverlay', { integer: true, min: 0, max: 90 }, nested);
    checkList(value, 'badges', 6, iconText, nested);
    checkCta(value, 'primaryCta', nested);
    checkCta(value, 'secondaryCta', nested);
    checkList(value, 'slides', SLIDER.MAX_SLIDES, slideRule, nested);
    checkSlider(value, nested);
  });

  checkList(body, 'features', 12, iconTitleText, errors);
  checkList(body, 'steps', 8, iconTitleText, errors);
  checkList(
    body,
    'subjects',
    24,
    (item, nested) => {
      checkIcon(item, nested);
      checkString(item, 'name', { required: true, nonEmpty: true, max: 60 }, nested);
    },
    errors
  );
  checkList(
    body,
    'faqs',
    40,
    (item, nested) => {
      checkString(item, 'question', { required: true, nonEmpty: true, max: 200 }, nested);
      checkString(item, 'answer', { required: true, nonEmpty: true, max: 1000 }, nested);
    },
    errors
  );

  validateNested(body, 'story', errors, (value, nested) => {
    checkString(value, 'eyebrow', { max: 60 }, nested);
    checkString(value, 'title', { max: 120 }, nested);
    checkString(value, 'highlight', { max: 80 }, nested);
    checkStringArray(value, 'paragraphs', { maxItems: 8, maxLength: 1500 }, nested);
  });

  return errors;
};

module.exports = { validateUpdateContent };