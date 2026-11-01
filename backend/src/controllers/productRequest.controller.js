const ProductRequest = require('../models/ProductRequest.model');
const Counter = require('../models/Counter.model');
const Node = require('../models/CatalogNode.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const { getPagination, getMeta } = require('../utils/pagination');
const service = require('../services/catalog.service');
const notifications = require('../services/notification.service');
const { REQUEST_STATUSES } = require('../constants/catalog');

const makeReference = async () => {
    const seq = await Counter.next('product-request');
    return `REQ-${new Date().getUTCFullYear()}-${String(seq).padStart(5, '0')}`;
};

const submit = asyncHandler(async (req, res) => {
    const body = req.body;

    if (body.website) {
        return res.status(201).json(new ApiResponse(201, { reference: 'REQ-0' }, 'Request received'));
    }

    const errors = [];
    const items = [];

    for (const [index, entry] of body.items.entries()) {
        const node = await Node.findOne(await service.publicFilter({ _id: entry.product })).lean();
        if (!node || !node.allowOrderRequest) {
            errors.push({ field: `items[${index}].product`, message: 'This item is not available for requests' });
            continue;
        }

        const [ancestors, options] = await Promise.all([service.loadAncestors(node), service.effectiveOptions(node)]);
        const { answers, errors: itemErrors } = service.buildAnswers(options, entry.options || {}, `items[${index}]`);
        errors.push(...itemErrors);

        items.push({
            product: node._id,
            productName: node.name,
            productSlug: node.slug,
            kind: node.kind,
            sku: node.sku || '',
            path: ancestors.map((ancestor) => ancestor.name),
            image: (node.cover && node.cover.url) || '',
            options: answers,
            note: String(entry.note || '').trim()
        });
    }

    if (errors.length > 0) throw new ApiError(400, 'Validation failed', errors);

    const request = await ProductRequest.create({
        reference: await makeReference(),
        name: body.name.trim(),
        company: String(body.company || '').trim(),
        email: String(body.email || '').trim(),
        phone: body.phone.trim(),
        city: String(body.city || '').trim(),
        message: String(body.message || '').trim(),
        items,
        statusHistory: [{ status: 'new', note: '' }],
        ipAddress: req.ip || '',
        userAgent: String(req.get('user-agent') || '').slice(0, 300),
        pageUrl: String(body.pageUrl || '').slice(0, 300)
    });

    notifications.notifyNewProductRequest(request);

    res.status(201).json(new ApiResponse(201, { reference: request.reference }, 'Request received'));
});

const buildFilter = (query) => {
    const filter = {};
    if (REQUEST_STATUSES.includes(query.status)) filter.status = query.status;
    if (query.unread === 'true') filter.readAt = null;
    if (query.product && /^[a-f\d]{24}$/i.test(query.product)) filter['items.product'] = query.product;

    const range = {};
    if (/^\d{4}-\d{2}-\d{2}$/.test(query.from || '')) range.$gte = new Date(`${query.from}T00:00:00.000Z`);
    if (/^\d{4}-\d{2}-\d{2}$/.test(query.to || '')) range.$lte = new Date(`${query.to}T23:59:59.999Z`);
    if (Object.keys(range).length > 0) filter.createdAt = range;

    if (query.search) {
        const regex = new RegExp(escapeRegex(query.search), 'i');
        filter.$or = [
            { reference: regex },
            { name: regex },
            { company: regex },
            { email: regex },
            { phone: regex },
            { 'items.productName': regex }
        ];
    }
    return filter;
};

const list = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = buildFilter(req.query);

    const [items, total] = await Promise.all([
        ProductRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        ProductRequest.countDocuments(filter)
    ]);

    res.status(200).json(new ApiResponse(200, items, 'Requests fetched successfully', getMeta(total, page, limit)));
});

const get = asyncHandler(async (req, res) => {
    const item = await ProductRequest.findByIdAndUpdate(
        req.params.id,
        [{ $set: { readAt: { $ifNull: ['$readAt', '$$NOW'] } } }],
        { new: true }
    ).lean();
    if (!item) throw new ApiError(404, 'Request not found');
    res.status(200).json(new ApiResponse(200, item, 'Request fetched successfully'));
});

const updateStatus = asyncHandler(async (req, res) => {
    const item = await ProductRequest.findById(req.params.id);
    if (!item) throw new ApiError(404, 'Request not found');

    item.status = req.body.status;
    item.statusHistory.push({
        status: req.body.status,
        note: String(req.body.note || '').trim(),
        by: req.admin._id,
        byName: req.admin.name || ''
    });
    if (!item.readAt) item.readAt = new Date();
    await item.save();

    res.status(200).json(new ApiResponse(200, item, 'Status updated successfully'));
});

const updateNote = asyncHandler(async (req, res) => {
    const item = await ProductRequest.findByIdAndUpdate(
        req.params.id,
        { $set: { adminNote: req.body.adminNote.trim() } },
        { new: true }
    );
    if (!item) throw new ApiError(404, 'Request not found');
    res.status(200).json(new ApiResponse(200, item, 'Note saved successfully'));
});

const remove = asyncHandler(async (req, res) => {
    const item = await ProductRequest.findByIdAndDelete(req.params.id);
    if (!item) throw new ApiError(404, 'Request not found');
    res.status(200).json(new ApiResponse(200, null, 'Request deleted successfully'));
});

const bulkRemove = asyncHandler(async (req, res) => {
    const outcome = await ProductRequest.deleteMany({ _id: { $in: req.body.ids } });
    res.status(200).json(new ApiResponse(200, { deleted: outcome.deletedCount }, 'Requests deleted successfully'));
});

const stats = asyncHandler(async (req, res) => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [rows, unread, lastWeek, total] = await Promise.all([
        ProductRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        ProductRequest.countDocuments({ readAt: null }),
        ProductRequest.countDocuments({ createdAt: { $gte: weekAgo } }),
        ProductRequest.countDocuments()
    ]);

    const byStatus = REQUEST_STATUSES.reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
    rows.forEach((row) => {
        byStatus[row._id] = row.count;
    });

    res.status(200).json(new ApiResponse(200, { total, unread, lastWeek, byStatus }, 'Stats fetched successfully'));
});

const unreadCount = asyncHandler(async (req, res) => {
    const count = await ProductRequest.countDocuments({ readAt: null });
    res.status(200).json(new ApiResponse(200, { count }, 'Unread count fetched successfully'));
});

const cell = (value) => {
    const text = String(value === undefined || value === null ? '' : value);
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
};

const exportCsv = asyncHandler(async (req, res) => {
    const items = await ProductRequest.find(buildFilter(req.query)).sort({ createdAt: -1 }).limit(5000).lean();
    const header = ['Reference', 'Date', 'Status', 'Name', 'Company', 'Phone', 'Email', 'City', 'Products', 'Options', 'Message'];

    const rows = items.map((item) => [
        item.reference,
        new Date(item.createdAt).toISOString(),
        item.status,
        item.name,
        item.company,
        item.phone,
        item.email,
        item.city,
        item.items.map((entry) => entry.productName).join(' | '),
        item.items
            .map((entry) => `${entry.productName}: ${entry.options.map((option) => `${option.title}=${option.display}`).join('; ')}`)
            .join(' | '),
        item.message
    ]);

    const csv = `\uFEFF${[header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')}`;
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="requests.csv"');
    res.status(200).send(csv);
});

module.exports = {
    submit,
    list,
    get,
    updateStatus,
    updateNote,
    remove,
    bulkRemove,
    stats,
    unreadCount,
    exportCsv
};