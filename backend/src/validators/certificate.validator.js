const {
  checkString,
  checkNumber,
  checkBoolean,
  checkEnum,
  checkAsset,
  checkHasFields
} = require('./common.validator');
const TEMPLATES = require('../constants/certificateTemplates');

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const FIELDS = [
  'studentName',
  'courseName',
  'hours',
  'grade',
  'issueDate',
  'completionDate',
  'notes',
  'template'
];
const SETTINGS_FIELDS = [
  'prefix',
  'title',
  'intro',
  'bodyLine',
  'signerName',
  'signerTitle',
  'signature',
  'footerNote',
  'defaultTemplate',
  'useBrandColors',
  'primaryColor',
  'secondaryColor'
];

const checkDate = (body, field, required, errors) => {
  const value = body[field];
  if (value === undefined || value === null || value === '') {
    if (required) errors.push({ field, message: `${field} is required` });
    return;
  }
  if (typeof value !== 'string' || !DATE.test(value) || Number.isNaN(new Date(value).getTime())) {
    errors.push({ field, message: `${field} must be a valid YYYY-MM-DD date` });
  }
};

const checkHex = (body, field, errors) => {
  const value = body[field];
  if (value === undefined || value === '') return;
  if (typeof value !== 'string' || !HEX.test(value)) {
    errors.push({ field, message: `${field} must be a hex color like #4f46e5` });
  }
};

const build = (isCreate) => (body) => {
  const errors = [];
  if (!isCreate) checkHasFields(body, FIELDS, errors);

  checkString(body, 'studentName', { required: isCreate, nonEmpty: true, max: 120 }, errors);
  checkString(body, 'courseName', { required: isCreate, nonEmpty: true, max: 150 }, errors);
  checkNumber(body, 'hours', { min: 0, max: 5000, nullable: true }, errors);
  checkString(body, 'grade', { max: 40 }, errors);
  checkString(body, 'notes', { max: 300 }, errors);
  checkDate(body, 'issueDate', isCreate, errors);
  checkDate(body, 'completionDate', false, errors);
  checkEnum(body, 'template', ['', ...TEMPLATES], errors);
  return errors;
};

const validateRevoke = (body) => {
  const errors = [];
  if (typeof body.revoked !== 'boolean') errors.push({ field: 'revoked', message: 'revoked must be a boolean' });
  checkString(body, 'reason', { max: 200 }, errors);
  return errors;
};

const validateCertificateSettings = (body) => {
  const errors = [];
  checkHasFields(body, SETTINGS_FIELDS, errors);
  if (body.prefix !== undefined && !/^[A-Za-z0-9]{2,8}$/.test(String(body.prefix))) {
    errors.push({ field: 'prefix', message: 'prefix must be 2 to 8 letters or digits' });
  }
  checkString(body, 'title', { nonEmpty: true, max: 80 }, errors);
  checkString(body, 'intro', { max: 120 }, errors);
  checkString(body, 'bodyLine', { max: 120 }, errors);
  checkString(body, 'signerName', { max: 80 }, errors);
  checkString(body, 'signerTitle', { max: 80 }, errors);
  checkString(body, 'footerNote', { max: 200 }, errors);
  checkAsset(body, 'signature', { required: false }, errors);
  checkEnum(body, 'defaultTemplate', TEMPLATES, errors);
  checkBoolean(body, 'useBrandColors', errors);
  checkHex(body, 'primaryColor', errors);
  checkHex(body, 'secondaryColor', errors);
  return errors;
};

module.exports = {
  validateCreateCertificate: build(true),
  validateUpdateCertificate: build(false),
  validateRevoke,
  validateCertificateSettings
};