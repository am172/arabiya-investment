const Subsidiary = require('../models/Subsidiary.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');
const destroyAsset = require('../utils/destroyAsset');
const { getPagination, getMeta } = require('../utils/pagination');

const ALLOWED_FIELDS = ['name', 'description', 'image', 'link', 'order', 'isActive'];

const getPublicSubsidiaries = asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const subsidiaries = await Subsidiary.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .limit(limit)
        .select('-__v')
        .lean();

    res.status(200).json(new ApiResponse(200, subsidiaries, 'Subsidiaries fetched successfully'));
});

const getSubsidiaries = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'i');
        filter.$or = [{ name: regex }, { description: regex }];
    }
    if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
    }

    const [items, total] = await Promise.all([
        Subsidiary.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
        Subsidiary.countDocuments(filter)
    ]);

    res
        .status(200)
        .json(new ApiResponse(200, items, 'Subsidiaries fetched successfully', getMeta(total, page, limit)));
});

const getSubsidiaryById = asyncHandler(async (req, res) => {
    const subsidiary = await Subsidiary.findById(req.params.id).lean();
    if (!subsidiary) throw new ApiError(404, 'Subsidiary not found');
    res.status(200).json(new ApiResponse(200, subsidiary, 'Subsidiary fetched successfully'));
});

const createSubsidiary = asyncHandler(async (req, res) => {
    const subsidiary = await Subsidiary.create(pick(req.body, ALLOWED_FIELDS));
    res.status(201).json(new ApiResponse(201, subsidiary, 'Subsidiary created successfully'));
});

const updateSubsidiary = asyncHandler(async (req, res) => {
    const subsidiary = await Subsidiary.findById(req.params.id);
    if (!subsidiary) throw new ApiError(404, 'Subsidiary not found');

    const payload = pick(req.body, ALLOWED_FIELDS);
    const previousPublicId = subsidiary.image ? subsidiary.image.publicId : '';

    subsidiary.set(payload);
    await subsidiary.save();

    if (payload.image && previousPublicId && previousPublicId !== subsidiary.image.publicId) {
        await destroyAsset(previousPublicId);
    }

    res.status(200).json(new ApiResponse(200, subsidiary, 'Subsidiary updated successfully'));
});

const toggleSubsidiaryStatus = asyncHandler(async (req, res) => {
    const subsidiary = await Subsidiary.findById(req.params.id);
    if (!subsidiary) throw new ApiError(404, 'Subsidiary not found');
    subsidiary.isActive = !subsidiary.isActive;
    await subsidiary.save();
    res.status(200).json(new ApiResponse(200, subsidiary, 'Subsidiary status updated successfully'));
});

const reorderSubsidiaries = asyncHandler(async (req, res) => {
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

    await Subsidiary.bulkWrite(operations);
    res.status(200).json(new ApiResponse(200, null, 'Subsidiaries reordered successfully'));
});

const deleteSubsidiary = asyncHandler(async (req, res) => {
    const subsidiary = await Subsidiary.findById(req.params.id);
    if (!subsidiary) throw new ApiError(404, 'Subsidiary not found');

    await subsidiary.deleteOne();
    if (subsidiary.image && subsidiary.image.publicId) {
        await destroyAsset(subsidiary.image.publicId);
    }

    res.status(200).json(new ApiResponse(200, null, 'Subsidiary deleted successfully'));
});

module.exports = {
    getPublicSubsidiaries,
    getSubsidiaries,
    getSubsidiaryById,
    createSubsidiary,
    updateSubsidiary,
    toggleSubsidiaryStatus,
    reorderSubsidiaries,
    deleteSubsidiary
};