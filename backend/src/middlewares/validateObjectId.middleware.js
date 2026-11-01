const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const validateObjectId = (req, res, next, value) => {
  if (!mongoose.isValidObjectId(value)) {
    return next(new ApiError(400, 'Invalid resource id'));
  }
  next();
};

module.exports = validateObjectId;