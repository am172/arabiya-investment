const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const logger = require('../utils/logger');

const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
    return new ApiError(400, 'Validation failed', errors);
  }

  if (err.name === 'CastError') {
    return new ApiError(400, `Invalid value for field: ${err.path}`);
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const message = fields.length
      ? `Duplicate value for field: ${fields.join(', ')}`
      : 'Duplicate value detected';
    return new ApiError(409, message);
  }

  if (err.name === 'JsonWebTokenError') {
    return new ApiError(401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return new ApiError(401, 'Token expired');
  }

  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file is too large' : err.message;
    return new ApiError(400, message);
  }

  if (err.type === 'entity.parse.failed') {
    return new ApiError(400, 'Malformed JSON in request body');
  }

  if (err.type === 'entity.too.large') {
    return new ApiError(413, 'Request body is too large');
  }

  return null;
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const normalized = normalizeError(err);
  const statusCode = normalized ? normalized.statusCode : err.statusCode || 500;
  const isServerError = statusCode >= 500;

  const message =
    isServerError && env.isProduction ? 'Internal server error' : (normalized || err).message;

  if (isServerError) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
    if (!env.isProduction) console.error(err.stack);
  }

  const body = {
    success: false,
    statusCode,
    message: message || 'Internal server error',
    errors: normalized ? normalized.errors : []
  };

  if (!env.isProduction && err.stack) body.stack = err.stack;

  res.status(statusCode).json(body);
};

module.exports = errorHandler;