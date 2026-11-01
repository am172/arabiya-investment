const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) throw new ApiError(401, 'Authentication required');

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const admin = await Admin.findById(decoded.id).select('-password');
  if (!admin || admin.isActive === false) throw new ApiError(401, 'Unauthorized');

  if (
    admin.passwordChangedAt &&
    decoded.iat &&
    decoded.iat < Math.floor(admin.passwordChangedAt.getTime() / 1000)
  ) {
    throw new ApiError(401, 'Password was changed, please log in again');
  }

  req.admin = admin;
  next();
});

module.exports = { protect };