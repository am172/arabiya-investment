const Node = require('../models/CatalogNode.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const { getPagination, getMeta } = require('../utils/pagination');
const { take } = require('../utils/catalogHelpers');
const service = require('../services/catalog.service');

const CARD_FIELDS =
    'kind name slug summary cover badges isFeatured allowOrderRequest ctaLabel sku parent ancestors depth';
const FULL_FIELDS = [
    '_id',
    'kind',
    'name',
    'slug',
    'summary',
    'description',
    'sku',
    'banner',
    'cover',
    'gallery',
    'badges',
    'features',
    'specs',
    'documents',
    'allowOrderRequest',
    'ctaLabel',
    'isFeatured',
    'seo',
    'tags',
    'depth',
    'updatedAt'
];
const CARD_KEYS = CARD_FIELDS.split(' ').filter((key) => !['parent', 'ancestors'].includes(key));

const clientCache = (res) => res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');

const card = (node, extra = {}) => ({ _id: node._id, ...take(node, CARD_KEYS), ...extra });

const ordered = (query) => query.sort({ order: 1, createdAt: 1 });

const withChildCounts = async (nodes) => {
    const counts = await service.childCounts(nodes.map((node) => node._id), true);
    return nodes.map((node) => card(node, { childrenCount: counts.get(String(node._id)) || 0 }));
};

const tree = asyncHandler(async (req, res) => {
    const maxDepth = Math.min(Math.max(parseInt(req.query.maxDepth, 10) || 3, 1), 10);
    const [nodes, products] = await Promise.all([
        ordered(Node.find(await service.publicFilter({ depth: { $lt: maxDepth } })))
            .select('kind name slug parent ancestors depth cover summary isFeatured')
            .lean(),
        Node.find(await service.publicFilter({ kind: 'product' })).select('ancestors').lean()
    ]);

    const productCounts = new Map();
    products.forEach((product) =>
        product.ancestors.forEach((id) => productCounts.set(String(id), (productCounts.get(String(id)) || 0) + 1))
    );

    const data = service.buildTree(nodes, (node) => ({
        _id: node._id,
        kind: node.kind,
        name: node.name,
        slug: node.slug,
        cover: node.cover,
        summary: node.summary,
        isFeatured: node.isFeatured,
        parent: node.parent,
        productCount: productCounts.get(String(node._id)) || 0
    }));

    clientCache(res);
    res.status(200).json(new ApiResponse(200, data, 'Catalog tree fetched successfully'));
});

const categories = asyncHandler(async (req, res) => {
    const roots = await ordered(Node.find(await service.publicFilter({ kind: 'category', parent: null })))
        .select(`${CARD_FIELDS} banner`)
        .lean();

    const [cards, counts] = await Promise.all([
        withChildCounts(roots),
        Promise.all(
            roots.map(async (root) =>
                Node.countDocuments(await service.publicFilter({ kind: 'product', ancestors: root._id }))
            )
        )
    ]);

    const data = cards.map((item, index) => ({
        ...item,
        banner: roots[index].banner,
        productCount: counts[index]
    }));

    clientCache(res);
    res.status(200).json(new ApiResponse(200, data, 'Categories fetched successfully'));
});

const category = asyncHandler(async (req, res) => {
    const node = await service.findPublic('category', req.params.slug);
    if (!node) throw new ApiError(404, 'Category not found');

    const [ancestors, children, productCount] = await Promise.all([
        service.loadAncestors(node),
        ordered(Node.find(await service.publicFilter({ parent: node._id }))).select(CARD_FIELDS).lean(),
        Node.countDocuments(await service.publicFilter({ kind: 'product', ancestors: node._id }))
    ]);

    clientCache(res);
    res.status(200).json(
        new ApiResponse(
            200,
            {
                ...take(node, FULL_FIELDS),
                breadcrumbs: service.crumbs(ancestors),
                children: await withChildCounts(children),
                productCount
            },
            'Category fetched successfully'
        )
    );
});

const categoryProducts = asyncHandler(async (req, res) => {
    const node = await service.findPublic('category', req.params.slug);
    if (!node) throw new ApiError(404, 'Category not found');

    const { page, limit, skip } = getPagination(req.query);
    const scope = req.query.scope === 'children' ? { parent: node._id } : { ancestors: node._id };
    const extra = { kind: 'product', ...scope };
    if (req.query.featured === 'true') extra.isFeatured = true;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'i');
        extra.$or = [{ name: regex }, { summary: regex }, { sku: regex }, { tags: regex }];
    }

    const sorts = { new: { createdAt: -1 }, name: { name: 1 }, order: { order: 1, createdAt: 1 } };
    const sort = sorts[req.query.sort] || sorts.order;
    const filter = await service.publicFilter(extra);

    const [items, total] = await Promise.all([
        Node.find(filter).sort(sort).skip(skip).limit(limit).select(CARD_FIELDS).lean(),
        Node.countDocuments(filter)
    ]);

    clientCache(res);
    res
        .status(200)
        .json(new ApiResponse(200, items.map((item) => card(item)), 'Products fetched successfully', getMeta(total, page, limit)));
});

const product = asyncHandler(async (req, res) => {
    const node = await service.findPublic('product', req.params.slug);
    if (!node) throw new ApiError(404, 'Product not found');

    const [ancestors, options, children, siblings] = await Promise.all([
        service.loadAncestors(node),
        service.effectiveOptions(node),
        ordered(Node.find(await service.publicFilter({ parent: node._id }))).select(CARD_FIELDS).lean(),
        ordered(
            Node.find(await service.publicFilter({ parent: node.parent, kind: 'product', _id: { $ne: node._id } }))
        )
            .limit(6)
            .select(CARD_FIELDS)
            .lean()
    ]);

    clientCache(res);
    res.status(200).json(
        new ApiResponse(
            200,
            {
                ...take(node, FULL_FIELDS),
                breadcrumbs: service.crumbs(ancestors),
                options,
                children: await withChildCounts(children),
                related: siblings.map((item) => card(item))
            },
            'Product fetched successfully'
        )
    );
});

const featured = asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 24);
    const items = await ordered(Node.find(await service.publicFilter({ kind: 'product', isFeatured: true })))
        .limit(limit)
        .select(CARD_FIELDS)
        .lean();
    const namer = await service.pathNamer(items);

    clientCache(res);
    res
        .status(200)
        .json(new ApiResponse(200, items.map((item) => card(item, { path: namer(item) })), 'Featured products fetched successfully'));
});

const search = asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.status(200).json(new ApiResponse(200, [], 'Search results'));

    const regex = new RegExp(escapeRegex(q), 'i');
    const items = await Node.find(
        await service.publicFilter({ $or: [{ name: regex }, { summary: regex }, { sku: regex }, { tags: regex }] })
    )
        .sort({ kind: -1, name: 1 })
        .limit(20)
        .select(CARD_FIELDS)
        .lean();
    const namer = await service.pathNamer(items);

    res.status(200).json(new ApiResponse(200, items.map((item) => card(item, { path: namer(item) })), 'Search results'));
});

const sitemap = asyncHandler(async (req, res) => {
    const items = await Node.find(await service.publicFilter({})).select('kind slug updatedAt').lean();
    clientCache(res);
    res.status(200).json(
        new ApiResponse(
            200,
            items.map(({ kind, slug, updatedAt }) => ({ kind, slug, updatedAt })),
            'Sitemap fetched successfully'
        )
    );
});

module.exports = { tree, categories, category, categoryProducts, product, featured, search, sitemap };