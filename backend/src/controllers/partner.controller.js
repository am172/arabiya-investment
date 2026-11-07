const Partner = require('../models/Partner.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const destroyAsset = require('../utils/destroyAsset');

const MAX_PARTNERS = 60;
const FIELDS = ['name', 'image', 'url', 'isActive'];

const clean = (payload) => {
    const data = { ...payload };
    if (data.name !== undefined) data.name = String(data.name).trim();
    if (data.url !== undefined) data.url = String(data.url).trim();
    if (data.image) {
        data.image = { url: String(data.image.url).trim(), publicId: String(data.image.publicId || '').trim() };
    }
    return data;
};

const list = asyncHandler(async (req, res) => {
    const items = await Partner.find().sort({ order: 1, createdAt: 1 }).limit(200).lean();
    res.status(200).json(new ApiResponse(200, items, 'Partners fetched successfully'));
});

const create = asyncHandler(async (req, res) => {
    const total = await Partner.countDocuments();
    if (total >= MAX_PARTNERS) throw new ApiError(400, `You can add up to ${MAX_PARTNERS} partners`);

    const last = await Partner.findOne().sort({ order: -1 }).select('order').lean();
    const item = await Partner.create({ ...clean(pick(req.body, FIELDS)), order: last ? last.order + 1 : 0 });
    res.status(201).json(new ApiResponse(201, item, 'Partner created successfully'));
});

const update = asyncHandler(async (req, res) => {
    const item = await Partner.findById(req.params.id);
    if (!item) throw new ApiError(404, 'Partner not found');

    const previous = item.image ? item.image.publicId : '';
    item.set(clean(pick(req.body, FIELDS)));
    await item.save();

    if (previous && previous !== item.image.publicId) await destroyAsset(previous);
    res.status(200).json(new ApiResponse(200, item, 'Partner updated successfully'));
});

const remove = asyncHandler(async (req, res) => {
    const item = await Partner.findById(req.params.id);
    if (!item) throw new ApiError(404, 'Partner not found');

    await item.deleteOne();
    if (item.image && item.image.publicId) await destroyAsset(item.image.publicId);
    res.status(200).json(new ApiResponse(200, null, 'Partner deleted successfully'));
});

const reorder = asyncHandler(async (req, res) => {
    const ids = [...new Set(req.body.ids.map(String))];
    const existing = await Partner.find().sort({ order: 1, createdAt: 1 }).select('_id').lean();
    const known = new Set(existing.map((item) => String(item._id)));

    if (ids.some((id) => !known.has(id))) throw new ApiError(400, 'Unknown partner in the list');

    const rest = existing.map((item) => String(item._id)).filter((id) => !ids.includes(id));
    await Partner.bulkWrite(
        [...ids, ...rest].map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index } } } }))
    );
    res.status(200).json(new ApiResponse(200, null, 'Order saved successfully'));
});

const listPublic = asyncHandler(async (req, res) => {
    const items = await Partner.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).select('name image url').lean();
    const data = items.map(({ _id, name, image, url }) => ({ _id, name, image: { url: image.url }, url }));

    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    res.status(200).json(new ApiResponse(200, data, 'Partners fetched successfully'));
});

module.exports = { list, create, update, remove, reorder, listPublic };