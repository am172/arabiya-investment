const Node = require('../models/CatalogNode.model');
const OptionTemplate = require('../models/OptionTemplate.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const { getPagination, getMeta } = require('../utils/pagination');
const { take } = require('../utils/catalogHelpers');
const service = require('../services/catalog.service');

const OBJECT_ID = /^[a-f\d]{24}$/i;
const LIST_FIELDS =
    'kind name slug parent ancestors depth order isActive isFeatured cover summary sku badges allowOrderRequest updatedAt createdAt';
const TREE_FIELDS = 'kind name slug parent ancestors depth order isActive isFeatured cover allowOrderRequest';
const FLAGS = ['isActive', 'isFeatured', 'allowOrderRequest'];
const FLAG_ACTIONS = {
    activate: { isActive: true },
    deactivate: { isActive: false },
    feature: { isFeatured: true },
    unfeature: { isFeatured: false },
    enableRequests: { allowOrderRequest: true },
    disableRequests: { allowOrderRequest: false }
};

const find = async (id) => {
    const node = await Node.findById(id);
    if (!node) throw new ApiError(404, 'Item not found');
    return node;
};

const list = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { parent, kind, status, featured, search } = req.query;
    const filter = {};

    if (parent === 'root' || (!parent && !search)) filter.parent = null;
    else if (parent && parent !== 'all') {
        if (!OBJECT_ID.test(parent)) throw new ApiError(400, 'Invalid parent id');
        filter.parent = parent;
    }
    if (kind === 'category' || kind === 'product') filter.kind = kind;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (featured === 'true') filter.isFeatured = true;
    if (search) {
        const regex = new RegExp(escapeRegex(search), 'i');
        filter.$or = [{ name: regex }, { slug: regex }, { sku: regex }, { summary: regex }, { tags: regex }];
    }

    const sort = search ? { updatedAt: -1 } : { order: 1, createdAt: 1 };
    const [items, total] = await Promise.all([
        Node.find(filter).sort(sort).skip(skip).limit(limit).select(LIST_FIELDS).lean(),
        Node.countDocuments(filter)
    ]);

    const [counts, namer] = await Promise.all([
        service.childCounts(items.map((item) => item._id)),
        search ? service.pathNamer(items) : null
    ]);

    const data = items.map((item) => ({
        ...item,
        childrenCount: counts.get(String(item._id)) || 0,
        ...(namer ? { path: namer(item) } : {})
    }));

    res.status(200).json(new ApiResponse(200, data, 'Items fetched successfully', getMeta(total, page, limit)));
});

const tree = asyncHandler(async (req, res) => {
    const nodes = await Node.find().sort({ order: 1, createdAt: 1 }).select(TREE_FIELDS).lean();
    const decorate = service.withCounts(nodes);
    const data = service.buildTree(nodes, (node) => ({
        _id: node._id,
        kind: node.kind,
        name: node.name,
        slug: node.slug,
        parent: node.parent,
        depth: node.depth,
        order: node.order,
        isActive: node.isActive,
        isFeatured: node.isFeatured,
        allowOrderRequest: node.allowOrderRequest,
        cover: node.cover,
        ...decorate(node)
    }));

    res.status(200).json(new ApiResponse(200, { tree: data, total: nodes.length }, 'Tree fetched successfully'));
});

const get = asyncHandler(async (req, res) => {
    const node = await Node.findById(req.params.id).lean();
    if (!node) throw new ApiError(404, 'Item not found');

    const [ancestors, children, effectiveOptions] = await Promise.all([
        service.loadAncestors(node),
        Node.find({ parent: node._id }).sort({ order: 1, createdAt: 1 }).select(LIST_FIELDS).lean(),
        service.effectiveOptions(node)
    ]);
    const counts = await service.childCounts(children.map((child) => child._id));

    res.status(200).json(
        new ApiResponse(
            200,
            {
                ...node,
                breadcrumbs: service.crumbs(ancestors),
                children: children.map((child) => ({ ...child, childrenCount: counts.get(String(child._id)) || 0 })),
                effectiveOptions
            },
            'Item fetched successfully'
        )
    );
});

const create = asyncHandler(async (req, res) => {
    const node = await service.createNode({ ...req.body, parent: req.body.parent || null }, req.admin._id);
    res.status(201).json(new ApiResponse(201, node, 'Item created successfully'));
});

const update = asyncHandler(async (req, res) => {
    const node = await service.updateNode(await find(req.params.id), req.body);
    res.status(200).json(new ApiResponse(200, node, 'Item updated successfully'));
});

const setFlags = asyncHandler(async (req, res) => {
    const node = await Node.findByIdAndUpdate(req.params.id, { $set: take(req.body, FLAGS) }, { new: true });
    if (!node) throw new ApiError(404, 'Item not found');
    service.invalidate();
    res.status(200).json(new ApiResponse(200, node, 'Item updated successfully'));
});

const move = asyncHandler(async (req, res) => {
    const node = await service.moveNode(req.params.id, req.body.parent || null, req.body.index);
    res.status(200).json(new ApiResponse(200, node, 'Item moved successfully'));
});

const reorder = asyncHandler(async (req, res) => {
    await service.reorder(req.body.parent || null, req.body.ids);
    res.status(200).json(new ApiResponse(200, null, 'Order saved successfully'));
});

const duplicate = asyncHandler(async (req, res) => {
    const node = await service.duplicateNode(req.params.id, req.body, req.admin._id);
    res.status(201).json(new ApiResponse(201, node, 'Item duplicated successfully'));
});

const applyTemplate = asyncHandler(async (req, res) => {
    const [node, template] = await Promise.all([find(req.params.id), OptionTemplate.findById(req.body.templateId).lean()]);
    if (!template) throw new ApiError(404, 'Template not found');
    const updated = await service.applyOptions(node, template.options, req.body.mode);
    res.status(200).json(new ApiResponse(200, updated, 'Template applied successfully'));
});

const copyOptions = asyncHandler(async (req, res) => {
    const [node, source] = await Promise.all([find(req.params.id), Node.findById(req.body.fromId).lean()]);
    if (!source) throw new ApiError(404, 'Source item not found');
    if (String(source._id) === String(node._id)) throw new ApiError(400, 'Choose a different item to copy from');
    const updated = await service.applyOptions(node, source.options || [], req.body.mode);
    res.status(200).json(new ApiResponse(200, updated, 'Options copied successfully'));
});

const remove = asyncHandler(async (req, res) => {
    const removed = await service.removeNode(req.params.id, req.query.strategy);
    res.status(200).json(new ApiResponse(200, { removed }, 'Item deleted successfully'));
});

const bulk = asyncHandler(async (req, res) => {
    const { ids, action, parent, strategy } = req.body;
    const result = { done: 0, failed: [] };

    if (FLAG_ACTIONS[action]) {
        const outcome = await Node.updateMany({ _id: { $in: ids } }, { $set: FLAG_ACTIONS[action] });
        service.invalidate();
        result.done = outcome.modifiedCount;
    } else {
        for (const id of ids) {
            try {
                if (action === 'delete') await service.removeNode(id, strategy);
                else await service.moveNode(id, parent || null, undefined);
                result.done += 1;
            } catch (error) {
                result.failed.push({ id, message: error.message });
            }
        }
    }

    res.status(200).json(new ApiResponse(200, result, 'Bulk action finished'));
});

module.exports = {
    list,
    tree,
    get,
    create,
    update,
    setFlags,
    move,
    reorder,
    duplicate,
    applyTemplate,
    copyOptions,
    remove,
    bulk
};