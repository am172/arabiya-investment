const Video = require('../models/Video.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');
const destroyAsset = require('../utils/destroyAsset');
const { getPagination, getMeta } = require('../utils/pagination');

const ALLOWED_FIELDS = [
  'title',
  'description',
  'studentName',
  'studentAge',
  'source',
  'videoUrl',
  'videoPublicId',
  'thumbnail',
  'duration',
  'isFeatured',
  'order',
  'isActive'
];

const cleanupAssets = async (video) => {
  if (video.source === 'upload' && video.videoPublicId) {
    await destroyAsset(video.videoPublicId, 'video');
  }
  if (video.thumbnail && video.thumbnail.publicId) {
    await destroyAsset(video.thumbnail.publicId);
  }
};

const getPublicVideos = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 0, 50);
  const filter = { isActive: true };
  if (req.query.featured === 'true') filter.isFeatured = true;

  const query = Video.find(filter).sort({ order: 1, createdAt: -1 });
  if (limit) query.limit(limit);
  const videos = await query.lean();

  res.status(200).json(new ApiResponse(200, videos, 'Videos fetched successfully'));
});

const getVideos = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ title: regex }, { studentName: regex }];
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  if (req.query.isFeatured !== undefined) {
    filter.isFeatured = req.query.isFeatured === 'true';
  }
  if (req.query.source) {
    filter.source = req.query.source;
  }

  const [items, total] = await Promise.all([
    Video.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Video.countDocuments(filter)
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, items, 'Videos fetched successfully', getMeta(total, page, limit)));
});

const getVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).lean();
  if (!video) throw new ApiError(404, 'Video not found');
  res.status(200).json(new ApiResponse(200, video, 'Video fetched successfully'));
});

const createVideo = asyncHandler(async (req, res) => {
  const video = await Video.create(pick(req.body, ALLOWED_FIELDS));
  res.status(201).json(new ApiResponse(201, video, 'Video created successfully'));
});

const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) throw new ApiError(404, 'Video not found');

  const payload = pick(req.body, ALLOWED_FIELDS);
  const previousVideoPublicId = video.videoPublicId;
  const previousSource = video.source;
  const previousThumbnailPublicId = video.thumbnail ? video.thumbnail.publicId : '';

  video.set(payload);
  await video.save();

  if (
    previousSource === 'upload' &&
    previousVideoPublicId &&
    previousVideoPublicId !== video.videoPublicId
  ) {
    await destroyAsset(previousVideoPublicId, 'video');
  }

  if (
    payload.thumbnail &&
    previousThumbnailPublicId &&
    previousThumbnailPublicId !== video.thumbnail.publicId
  ) {
    await destroyAsset(previousThumbnailPublicId);
  }

  res.status(200).json(new ApiResponse(200, video, 'Video updated successfully'));
});

const toggleVideoStatus = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) throw new ApiError(404, 'Video not found');
  video.isActive = !video.isActive;
  await video.save();
  res.status(200).json(new ApiResponse(200, video, 'Video status updated successfully'));
});

const toggleVideoFeatured = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) throw new ApiError(404, 'Video not found');
  video.isFeatured = !video.isFeatured;
  await video.save();
  res.status(200).json(new ApiResponse(200, video, 'Video featured status updated successfully'));
});

const reorderVideos = asyncHandler(async (req, res) => {
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

  await Video.bulkWrite(operations);
  res.status(200).json(new ApiResponse(200, null, 'Videos reordered successfully'));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) throw new ApiError(404, 'Video not found');

  await video.deleteOne();
  await cleanupAssets(video);

  res.status(200).json(new ApiResponse(200, null, 'Video deleted successfully'));
});

module.exports = {
  getPublicVideos,
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  toggleVideoStatus,
  toggleVideoFeatured,
  reorderVideos,
  deleteVideo
};