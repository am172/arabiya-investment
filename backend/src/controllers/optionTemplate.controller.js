const OptionTemplate = require('../models/OptionTemplate.model');
const Node = require('../models/CatalogNode.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const { take } = require('../utils/catalogHelpers');
const service = require('../services/catalog.service');

const list = asyncHandler(async (req, res) => {
    const filter = req.query.search ? { name: new RegExp(escapeRegex(req.query.search), 'i') } : {};
    const items = await OptionTemplate.find(filter).sort({ name: 1 }).limit(200).lean();
    res.status(200).json(new ApiResponse(200, items, 'Templates fetched successfully'));
});

const get = asyncHandler(async (req, res) => {
    const item = await OptionTemplate.findById(req.params.id).lean();
    if (!item) throw new ApiError(404, 'Template not found');
    res.status(200).json(new ApiResponse(200, item, 'Template fetched successfully'));
});

const create = asyncHandler(async (req, res) => {
    const item = await OptionTemplate.create({
        name: req.body.name,
        description: req.body.description || '',
        options: service.normalizeOptions(req.body.options),
        createdBy: req.admin._id
    });
    res.status(201).json(new ApiResponse(201, item, 'Template created successfully'));
});

const fromNode = asyncHandler(async (req, res) => {
    const node = await Node.findById(req.body.nodeId).lean();
    if (!node) throw new ApiError(404, 'Item not found');
    const options = await service.effectiveOptions(node);
    const item = await OptionTemplate.create({
        name: req.body.name,
        description: req.body.description || '',
        options: service.regenerateKeys(options),
        createdBy: req.admin._id
    });
    res.status(201).json(new ApiResponse(201, item, 'Template created successfully'));
});

const update = asyncHandler(async (req, res) => {
    const item = await OptionTemplate.findById(req.params.id);
    if (!item) throw new ApiError(404, 'Template not found');
    const payload = take(req.body, ['name', 'description']);
    if (req.body.options !== undefined) payload.options = service.normalizeOptions(req.body.options);
    item.set(payload);
    await item.save();
    res.status(200).json(new ApiResponse(200, item, 'Template updated successfully'));
});

const remove = asyncHandler(async (req, res) => {
    const item = await OptionTemplate.findByIdAndDelete(req.params.id);
    if (!item) throw new ApiError(404, 'Template not found');
    res.status(200).json(new ApiResponse(200, null, 'Template deleted successfully'));
});

module.exports = { list, get, create, fromNode, update, remove };