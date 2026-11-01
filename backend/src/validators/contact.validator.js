const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^[+()\d\s-]{6,30}$/;
const STATUSES = ['new', 'read', 'replied', 'archived'];

const isString = (value) => typeof value === 'string' && value.trim().length > 0;

const validateCreateContact = (body) => {
  const errors = [];

  if (!isString(body.name) || body.name.trim().length < 2 || body.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Name must be between 2 and 100 characters' });
  }
  if (!isString(body.email) || !EMAIL_REGEX.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  }
  if (body.phone !== undefined && body.phone !== '' && !PHONE_REGEX.test(String(body.phone).trim())) {
    errors.push({ field: 'phone', message: 'Invalid phone number' });
  }
  if (body.subject !== undefined && (typeof body.subject !== 'string' || body.subject.length > 150)) {
    errors.push({ field: 'subject', message: 'Subject must be up to 150 characters' });
  }
  if (!isString(body.message) || body.message.trim().length < 10 || body.message.trim().length > 2000) {
    errors.push({ field: 'message', message: 'Message must be between 10 and 2000 characters' });
  }
  if (
    body.childAge !== undefined &&
    body.childAge !== '' &&
    (!Number.isInteger(Number(body.childAge)) || Number(body.childAge) < 1 || Number(body.childAge) > 18)
  ) {
    errors.push({ field: 'childAge', message: 'Child age must be between 1 and 18' });
  }
  if (
    body.packageInterest !== undefined &&
    (typeof body.packageInterest !== 'string' || body.packageInterest.length > 100)
  ) {
    errors.push({ field: 'packageInterest', message: 'Package interest must be up to 100 characters' });
  }

  return errors;
};

const validateUpdateContactStatus = (body) => {
  const errors = [];
  if (!STATUSES.includes(body.status)) {
    errors.push({ field: 'status', message: `Status must be one of: ${STATUSES.join(', ')}` });
  }
  return errors;
};

const validateBulkDelete = (body) => {
  const errors = [];
  if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.length > 100) {
    errors.push({ field: 'ids', message: 'ids must be an array of 1 to 100 items' });
  }
  return errors;
};

module.exports = { validateCreateContact, validateUpdateContactStatus, validateBulkDelete };