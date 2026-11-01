const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const isString = (value) => typeof value === 'string' && value.trim().length > 0;

const validateLogin = (body) => {
  const errors = [];
  if (!isString(body.email) || !EMAIL_REGEX.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  }
  if (!isString(body.password)) {
    errors.push({ field: 'password', message: 'Password is required' });
  }
  return errors;
};

const validateUpdateProfile = (body) => {
  const errors = [];
  if (body.name !== undefined && (!isString(body.name) || body.name.trim().length > 100)) {
    errors.push({ field: 'name', message: 'Name must be between 1 and 100 characters' });
  }
  if (body.email !== undefined && (!isString(body.email) || !EMAIL_REGEX.test(body.email.trim()))) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  }
  if (body.name === undefined && body.email === undefined && body.avatar === undefined) {
    errors.push({ field: 'body', message: 'No valid fields provided' });
  }
  return errors;
};

const validateChangePassword = (body) => {
  const errors = [];
  if (!isString(body.currentPassword)) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }
  if (!isString(body.newPassword) || body.newPassword.length < 8) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 8 characters' });
  } else if (body.newPassword.length > 128) {
    errors.push({ field: 'newPassword', message: 'New password must not exceed 128 characters' });
  }
  if (body.newPassword && body.newPassword === body.currentPassword) {
    errors.push({ field: 'newPassword', message: 'New password must differ from the current one' });
  }
  if (body.confirmPassword !== undefined && body.confirmPassword !== body.newPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  return errors;
};

module.exports = { validateLogin, validateUpdateProfile, validateChangePassword };