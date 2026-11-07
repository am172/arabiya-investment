const BranchGroup = require('../models/BranchGroup.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');

const MAX_GROUPS = 30;
const FIELDS = ['title', 'lat', 'lng', 'offices', 'isActive'];

const clean = (payload) => {
    const data = { ...payload };
    if (data.title !== undefined) data.title = data.title.trim();
    if (data.offices) {
        data.offices = data.offices.map((office) => ({
            name: office.name.trim(),
            lat: office.lat === undefined ? null : office.lat,
            lng: office.lng === undefined ? null : office.lng
        }));
    }
    return data;
};

const list = asyncHandler(async (req, res) => {
    const items = await BranchGroup.find().sort({ order: 1, createdAt: 1 }).lean();
    res.status(200).json(new ApiResponse(200, items, 'Branches fetched successfully'));
});

const create = asyncHandler(async (req, res) => {
    if ((await BranchGroup.countDocuments()) >= MAX_GROUPS) throw new ApiError(400, `Up to ${MAX_GROUPS} groups`);
    const last = await BranchGroup.findOne().sort({ order: -1 }).select('order').lean();
    const item = await BranchGroup.create({ ...clean(pick(req.body, FIELDS)), order: last ? last.order + 1 : 0 });
    res.status(201).json(new ApiResponse(201, item, 'Branch created successfully'));
});

const update = asyncHandler(async (req, res) => {
    const item = await BranchGroup.findById(req.params.id);
    if (!item) throw new ApiError(404, 'Branch not found');
    item.set(clean(pick(req.body, FIELDS)));
    await item.save();
    res.status(200).json(new ApiResponse(200, item, 'Branch updated successfully'));
});

const remove = asyncHandler(async (req, res) => {
    const item = await BranchGroup.findByIdAndDelete(req.params.id);
    if (!item) throw new ApiError(404, 'Branch not found');
    res.status(200).json(new ApiResponse(200, null, 'Branch deleted successfully'));
});

const reorder = asyncHandler(async (req, res) => {
    const ids = [...new Set(req.body.ids.map(String))];
    const existing = await BranchGroup.find().sort({ order: 1, createdAt: 1 }).select('_id').lean();
    const known = new Set(existing.map((item) => String(item._id)));
    if (ids.some((id) => !known.has(id))) throw new ApiError(400, 'Unknown branch in the list');

    const rest = existing.map((item) => String(item._id)).filter((id) => !ids.includes(id));
    await BranchGroup.bulkWrite(
        [...ids, ...rest].map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index } } } }))
    );
    res.status(200).json(new ApiResponse(200, null, 'Order saved successfully'));
});

const listPublic = asyncHandler(async (req, res) => {
    const items = await BranchGroup.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
    const data = items.map((item) => ({
        _id: item._id,
        title: item.title,
        lat: item.lat,
        lng: item.lng,
        offices: item.offices.map(({ name, lat, lng }) => ({ name, lat, lng }))
    }));

    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    res.status(200).json(new ApiResponse(200, data, 'Branches fetched successfully'));
});

module.exports = { list, create, update, remove, reorder, listPublic };