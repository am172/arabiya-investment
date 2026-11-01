const Stat = require('../models/Stat.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');
const { getPagination, getMeta } = require('../utils/pagination');

const ALLOWED_FIELDS = [
  'label',
  'value',
  'prefix',
  'suffix',
  'icon',
  'description',
  'order',
  'isActive'
];

const getPublicStats = asyncHandler(async (req, res) => {
  const stats = await Stat.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
  res.status(200).json(new ApiResponse(200, stats, 'Stats fetched successfully'));
});

const getStats = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.search) {
    filter.label = new RegExp(escapeRegex(req.query.search), 'i');
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const [items, total] = await Promise.all([
    Stat.find(filter).sort({ order: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
    Stat.countDocuments(filter)
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, items, 'Stats fetched successfully', getMeta(total, page, limit)));
});

const getStatById = asyncHandler(async (req, res) => {
  const stat = await Stat.findById(req.params.id).lean();
  if (!stat) throw new ApiError(404, 'Stat not found');
  res.status(200).json(new ApiResponse(200, stat, 'Stat fetched successfully'));
});

const createStat = asyncHandler(async (req, res) => {
  const stat = await Stat.create(pick(req.body, ALLOWED_FIELDS));
  res.status(201).json(new ApiResponse(201, stat, 'Stat created successfully'));
});

const updateStat = asyncHandler(async (req, res) => {
  const stat = await Stat.findById(req.params.id);
  if (!stat) throw new ApiError(404, 'Stat not found');

  stat.set(pick(req.body, ALLOWED_FIELDS));
  await stat.save();

  res.status(200).json(new ApiResponse(200, stat, 'Stat updated successfully'));
});

const toggleStatStatus = asyncHandler(async (req, res) => {
  const stat = await Stat.findById(req.params.id);
  if (!stat) throw new ApiError(404, 'Stat not found');
  stat.isActive = !stat.isActive;
  await stat.save();
  res.status(200).json(new ApiResponse(200, stat, 'Stat status updated successfully'));
});

const reorderStats = asyncHandler(async (req, res) => {
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

  await Stat.bulkWrite(operations);
  res.status(200).json(new ApiResponse(200, null, 'Stats reordered successfully'));
});

const deleteStat = asyncHandler(async (req, res) => {
  const stat = await Stat.findById(req.params.id);
  if (!stat) throw new ApiError(404, 'Stat not found');
  await stat.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Stat deleted successfully'));
});

module.exports = {
  getPublicStats,
  getStats,
  getStatById,
  createStat,
  updateStat,
  toggleStatStatus,
  reorderStats,
  deleteStat
};