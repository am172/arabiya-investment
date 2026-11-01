const Admin = require('../models/Admin.model');
const ROLES = require('../constants/roles');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');
const destroyAsset = require('../utils/destroyAsset');
const { getPagination, getMeta } = require('../utils/pagination');

const UPDATE_FIELDS = ['name', 'email', 'role', 'isActive'];

const isSelf = (req, admin) => String(req.admin._id) === String(admin._id);

const assertNotLastSuperAdmin = async (admin) => {
  if (admin.role !== ROLES.SUPER_ADMIN || !admin.isActive) return;
  const others = await Admin.countDocuments({
    _id: { $ne: admin._id },
    role: ROLES.SUPER_ADMIN,
    isActive: true
  });
  if (others === 0) {
    throw new ApiError(400, 'At least one active super admin is required');
  }
};

const getAdmins = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }
  if (req.query.role && Object.values(ROLES).includes(req.query.role)) {
    filter.role = req.query.role;
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const [items, total] = await Promise.all([
    Admin.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Admin.countDocuments(filter)
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, items, 'Admins fetched successfully', getMeta(total, page, limit)));
});

const getAdminById = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) throw new ApiError(404, 'Admin not found');
  res.status(200).json(new ApiResponse(200, admin, 'Admin fetched successfully'));
});

const createAdmin = asyncHandler(async (req, res) => {
  const email = String(req.body.email).trim().toLowerCase();

  const existing = await Admin.findOne({ email }).select('_id');
  if (existing) throw new ApiError(409, 'An admin with this email already exists');

  const admin = await Admin.create({
    name: String(req.body.name).trim(),
    email,
    password: String(req.body.password),
    role: req.body.role || ROLES.ADMIN
  });

  res.status(201).json(new ApiResponse(201, admin, 'Admin created successfully'));
});

const updateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) throw new ApiError(404, 'Admin not found');

  const payload = pick(req.body, UPDATE_FIELDS);
  const self = isSelf(req, admin);

  if (self && payload.role !== undefined && payload.role !== admin.role) {
    throw new ApiError(400, 'You cannot change your own role');
  }
  if (self && payload.isActive === false) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }

  const demoting = payload.role !== undefined && payload.role !== ROLES.SUPER_ADMIN;
  const deactivating = payload.isActive === false;
  if (demoting || deactivating) await assertNotLastSuperAdmin(admin);

  if (payload.email !== undefined) {
    payload.email = String(payload.email).trim().toLowerCase();
    const duplicate = await Admin.findOne({ email: payload.email, _id: { $ne: admin._id } }).select(
      '_id'
    );
    if (duplicate) throw new ApiError(409, 'An admin with this email already exists');
  }

  admin.set(payload);
  await admin.save();

  res.status(200).json(new ApiResponse(200, admin, 'Admin updated successfully'));
});

const resetAdminPassword = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id).select('+password');
  if (!admin) throw new ApiError(404, 'Admin not found');

  admin.password = String(req.body.newPassword);
  await admin.save();

  res.status(200).json(new ApiResponse(200, null, 'Admin password reset successfully'));
});

const toggleAdminStatus = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) throw new ApiError(404, 'Admin not found');

  if (isSelf(req, admin)) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }
  if (admin.isActive) await assertNotLastSuperAdmin(admin);

  admin.isActive = !admin.isActive;
  await admin.save();

  res.status(200).json(new ApiResponse(200, admin, 'Admin status updated successfully'));
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) throw new ApiError(404, 'Admin not found');

  if (isSelf(req, admin)) {
    throw new ApiError(400, 'You cannot delete your own account');
  }
  await assertNotLastSuperAdmin(admin);

  await admin.deleteOne();
  if (admin.avatar && admin.avatar.publicId) await destroyAsset(admin.avatar.publicId);

  res.status(200).json(new ApiResponse(200, null, 'Admin deleted successfully'));
});

module.exports = {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  resetAdminPassword,
  toggleAdminStatus,
  deleteAdmin
};