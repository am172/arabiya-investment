const Admin = require('../models/Admin.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const pick = require('../utils/pick');
const destroyAsset = require('../utils/destroyAsset');

const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email).trim().toLowerCase();
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await admin.comparePassword(String(req.body.password)))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!admin.isActive) throw new ApiError(403, 'This account has been deactivated');

  admin.lastLoginAt = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = generateToken({ id: admin._id });
  res.status(200).json(new ApiResponse(200, { token, admin }, 'Logged in successfully'));
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.admin, 'Profile fetched successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);
  if (!admin) throw new ApiError(404, 'Admin not found');

  const payload = pick(req.body, ['name', 'email', 'avatar']);
  const previousAvatarId = admin.avatar ? admin.avatar.publicId : '';

  admin.set(payload);
  await admin.save();

  if (payload.avatar && previousAvatarId && previousAvatarId !== admin.avatar.publicId) {
    await destroyAsset(previousAvatarId);
  }

  res.status(200).json(new ApiResponse(200, admin, 'Profile updated successfully'));
});

const changePassword = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select('+password');
  if (!admin) throw new ApiError(404, 'Admin not found');

  const isMatch = await admin.comparePassword(String(req.body.currentPassword));
  if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

  admin.password = String(req.body.newPassword);
  await admin.save();

  const token = generateToken({ id: admin._id });
  res.status(200).json(new ApiResponse(200, { token }, 'Password changed successfully'));
});

const logout = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

module.exports = { login, getMe, updateProfile, changePassword, logout };