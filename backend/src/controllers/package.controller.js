const Package = require('../models/Package.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');
const { getPagination, getMeta } = require('../utils/pagination');

const ALLOWED_FIELDS = [
  'name',
  'description',
  'price',
  'discountPrice',
  'currency',
  'prices',
  'billingPeriod',
  'sessionsPerMonth',
  'sessionDuration',
  'features',
  'badge',
  'isPopular',
  'ctaLabel',
  'ctaLink',
  'order',
  'isActive'
];

const assertPricing = (price, discountPrice) => {
  if (discountPrice !== null && discountPrice !== undefined && discountPrice >= price) {
    throw new ApiError(400, 'Discount price must be lower than the regular price');
  }
};

const clearOtherPopular = (id) =>
  Package.updateMany({ _id: { $ne: id }, isPopular: true }, { $set: { isPopular: false } });

const getPublicPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
  res.status(200).json(new ApiResponse(200, packages, 'Packages fetched successfully'));
});

const getPackages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.search) {
    filter.name = new RegExp(escapeRegex(req.query.search), 'i');
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  if (req.query.billingPeriod) {
    filter.billingPeriod = req.query.billingPeriod;
  }

  const [items, total] = await Promise.all([
    Package.find(filter).sort({ order: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
    Package.countDocuments(filter)
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, items, 'Packages fetched successfully', getMeta(total, page, limit)));
});

const getPackageById = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id).lean();
  if (!pkg) throw new ApiError(404, 'Package not found');
  res.status(200).json(new ApiResponse(200, pkg, 'Package fetched successfully'));
});

const createPackage = asyncHandler(async (req, res) => {
  const payload = pick(req.body, ALLOWED_FIELDS);
  assertPricing(payload.price, payload.discountPrice);

  const pkg = await Package.create(payload);
  if (pkg.isPopular) await clearOtherPopular(pkg._id);

  res.status(201).json(new ApiResponse(201, pkg, 'Package created successfully'));
});

const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) throw new ApiError(404, 'Package not found');

  pkg.set(pick(req.body, ALLOWED_FIELDS));
  assertPricing(pkg.price, pkg.discountPrice);
  await pkg.save();

  if (pkg.isPopular) await clearOtherPopular(pkg._id);

  res.status(200).json(new ApiResponse(200, pkg, 'Package updated successfully'));
});

const togglePackageStatus = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) throw new ApiError(404, 'Package not found');
  pkg.isActive = !pkg.isActive;
  await pkg.save();
  res.status(200).json(new ApiResponse(200, pkg, 'Package status updated successfully'));
});

const setPopularPackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) throw new ApiError(404, 'Package not found');

  pkg.isPopular = true;
  await pkg.save();
  await clearOtherPopular(pkg._id);

  res.status(200).json(new ApiResponse(200, pkg, 'Popular package updated successfully'));
});

const reorderPackages = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Items array is required');
  }

  const operations = items.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: Number(order) || 0 } }
    }
  }));

  await Package.bulkWrite(operations);
  res.status(200).json(new ApiResponse(200, null, 'Packages reordered successfully'));
});

const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) throw new ApiError(404, 'Package not found');
  await pkg.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Package deleted successfully'));
});

module.exports = {
  getPublicPackages,
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  togglePackageStatus,
  setPopularPackage,
  reorderPackages,
  deletePackage
};