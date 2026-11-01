const {
  checkString,
  checkEmail,
  checkEnum,
  checkBoolean,
  checkHasFields
} = require('./common.validator');
const ROLES = require('../constants/roles');

const ROLE_VALUES = Object.values(ROLES);

const checkPassword = (body, field, errors) => {
  const value = body[field];
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) {
    errors.push({ field, message: `${field} must be between 8 and 128 characters` });
  }
};

const validateCreateAdmin = (body) => {
  const errors = [];
  checkString(body, 'name', { required: true, nonEmpty: true, max: 100 }, errors);
  checkEmail(body, 'email', { required: true, allowEmpty: false }, errors);
  checkPassword(body, 'password', errors);
  checkEnum(body, 'role', ROLE_VALUES, errors);
  return errors;
};

const validateUpdateAdmin = (body) => {
  const errors = [];
  checkHasFields(body, ['name', 'email', 'role', 'isActive'], errors);
  checkString(body, 'name', { nonEmpty: true, max: 100 }, errors);
  checkEmail(body, 'email', { allowEmpty: false }, errors);
  checkEnum(body, 'role', ROLE_VALUES, errors);
  checkBoolean(body, 'isActive', errors);
  return errors;
};

const validateResetPassword = (body) => {
  const errors = [];
  checkPassword(body, 'newPassword', errors);
  return errors;
};

module.exports = { validateCreateAdmin, validateUpdateAdmin, validateResetPassword };