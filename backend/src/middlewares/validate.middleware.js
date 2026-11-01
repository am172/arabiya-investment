const ApiError = require('../utils/ApiError');

const validate = (validator) => (req, res, next) => {
  const errors = validator(req.body || {});
  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed', errors));
  }
  next();
};

module.exports = validate;