const mongoose = require('mongoose');
const Node = require('../models/CatalogNode.model');
const ApiError = require('../utils/ApiError');
const destroyAsset = require('../utils/destroyAsset');
const { uniqueSlug } = require('../utils/slug');
const { KEY_PATTERN, makeKey, take, numberOrNull } = require('../utils/catalogHelpers');
const { MAX_DEPTH, MAX_DUPLICATE_NODES, CHOICE_TYPES, LIMITS } = require('../constants/catalog');

const CONTENT_FIELDS = [
    'name',
    'summary',
    'description',
    'sku',
    'banner',
    'gallery',
    'badges',
    'features',
    'specs',
    'documents',
    'inheritOptions',
    'allowOrderRequest',
    'ctaLabel',
    'seo',
    'tags',
    'isActive',
    'isFeatured'
];

const CLONE_FIELDS = [
    'kind',
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
    'inheritOptions',
    'allowOrderRequest',
    'ctaLabel',
    'seo',
    'tags',
    'isFeatured'
];

const HIDDEN_TTL = 5000;
let hidden = { at: 0, ids: [] };

const invalidate = () => {
    hidden = { at: 0, ids: [] };
};

const hiddenIds = async () => {
    if (Date.now() - hidden.at < HIDDEN_TTL) return hidden.ids;
    const ids = await Node.distinct('_id', { isActive: false });
    hidden = { at: Date.now(), ids };
    return ids;
};

const publicFilter = async (extra = {}) => ({
    $and: [extra, { isActive: true, ancestors: { $nin: await hiddenIds() } }]
});

const findPublic = async (kind, slug) => Node.findOne(await publicFilter({ kind, slug })).lean();

const normalizeOptions = (options = []) => {
    const used = new Set();

    const freshKey = (prefix, pool, candidate) => {
        let key = candidate && KEY_PATTERN.test(candidate) && !pool.has(candidate) ? candidate : makeKey(prefix);
        while (pool.has(key)) key = makeKey(prefix);
        pool.add(key);
        return key;
    };

    return options.map((option) => {
        const choice = CHOICE_TYPES.includes(option.type);
        const numeric = option.type === 'number';
        const texty = ['text', 'textarea'].includes(option.type);
        const pool = new Set();
        const values = choice
            ? (option.values || []).map((value) => ({
                key: freshKey('v', pool, value.key),
                label: String(value.label || '').trim(),
                description: String(value.description || '').trim(),
                isDefault: Boolean(value.isDefault)
            }))
            : [];

        if (option.type !== 'checkbox') {
            let seen = false;
            values.forEach((value) => {
                if (value.isDefault && seen) value.isDefault = false;
                if (value.isDefault) seen = true;
            });
        }

        return {
            key: freshKey('o', used, option.key),
            title: String(option.title || '').trim(),
            type: option.type,
            isRequired: Boolean(option.isRequired),
            helpText: String(option.helpText || '').trim(),
            placeholder: String(option.placeholder || '').trim(),
            values,
            min: numeric ? numberOrNull(option.min) : null,
            max: numeric ? numberOrNull(option.max) : null,
            step: numeric ? numberOrNull(option.step) : null,
            unit: numeric ? String(option.unit || '').trim() : '',
            defaultNumber: numeric ? numberOrNull(option.defaultNumber) : null,
            maxLength: texty ? numberOrNull(option.maxLength) : null
        };
    });
};

const regenerateKeys = (options = []) =>
    normalizeOptions(
        options.map((option) => ({
            ...option,
            key: undefined,
            values: (option.values || []).map((value) => ({ ...value, key: undefined }))
        }))
    );

const cleanAsset = (value) => ({
    url: String((value && value.url) || '').trim(),
    publicId: String((value && value.publicId) || '').trim()
});

const prepare = (data, current) => {
    const payload = take(data, CONTENT_FIELDS);

    if (data.options !== undefined) payload.options = normalizeOptions(data.options);
    if (data.banner !== undefined) payload.banner = cleanAsset(data.banner);
    if (data.tags !== undefined) {
        payload.tags = [...new Set(data.tags.map((tag) => String(tag).trim()).filter(Boolean))];
    }
    if (data.gallery !== undefined) {
        payload.gallery = data.gallery.map((item) => ({
            url: String(item.url).trim(),
            publicId: String(item.publicId || '').trim(),
            alt: String(item.alt || '').trim(),
            isCover: Boolean(item.isCover)
        }));
    }
    if (data.seo !== undefined) {
        const base =
            current && current.seo
                ? {
                    title: current.seo.title,
                    description: current.seo.description,
                    keywords: [...(current.seo.keywords || [])]
                }
                : {};
        payload.seo = {
            title: '',
            description: '',
            keywords: [],
            ...base,
            ...take(data.seo, ['title', 'description', 'keywords'])
        };
    }

    return payload;
};

const assetRefs = (node) => {
    const refs = [];
    (node.gallery || []).forEach((item) => item.publicId && refs.push({ id: item.publicId, type: 'image' }));
    if (node.banner && node.banner.publicId) refs.push({ id: node.banner.publicId, type: 'image' });
    (node.documents || []).forEach(
        (doc) => doc.publicId && refs.push({ id: doc.publicId, type: doc.resourceType || 'raw' })
    );
    return refs;
};

const releaseAssets = async (refs) => {
    const unique = [...new Map(refs.map((ref) => [ref.id, ref])).values()];
    await Promise.all(
        unique.map(async (ref) => {
            const used = await Node.exists({
                $or: [
                    { 'gallery.publicId': ref.id },
                    { 'banner.publicId': ref.id },
                    { 'documents.publicId': ref.id }
                ]
            });
            if (!used) await destroyAsset(ref.id, ref.type);
        })
    );
};

const resolveParent = async (parentId) => {
    if (!parentId) return { parent: null, ancestors: [], depth: 0 };
    const parent = await Node.findById(parentId).select('ancestors depth').lean();
    if (!parent) throw new ApiError(404, 'Parent item not found');
    if (parent.depth + 1 > MAX_DEPTH) throw new ApiError(400, 'Maximum nesting depth reached');
    return { parent: parent._id, ancestors: [...parent.ancestors, parent._id], depth: parent.depth + 1 };
};

const nextOrder = async (parent) => {
    const last = await Node.findOne({ parent: parent || null }).sort({ order: -1 }).select('order').lean();
    return last ? last.order + 1 : 0;
};

const reindex = async (ids) => {
    if (!ids.length) return;
    await Node.bulkWrite(
        ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index } } } }))
    );
};

const createNode = async (data, adminId) => {
    const place = await resolveParent(data.parent);
    const slug = await uniqueSlug(Node, { kind: data.kind }, data.slug || data.name);
    const order = Number.isInteger(data.order) ? data.order : await nextOrder(place.parent);
    const defaults = data.kind === 'category' ? { allowOrderRequest: false } : {};

    const node = await Node.create({
        ...defaults,
        ...prepare(data),
        kind: data.kind,
        ...place,
        slug,
        order,
        createdBy: adminId
    });

    invalidate();
    return node;
};

const updateNode = async (node, data) => {
    const before = assetRefs(node);
    const payload = prepare(data, node);

    if (data.slug !== undefined && data.slug !== '' && data.slug !== node.slug) {
        payload.slug = await uniqueSlug(Node, { kind: node.kind }, data.slug, { excludeId: node._id });
    }

    node.set(payload);
    await node.save();

    const after = new Set(assetRefs(node).map((ref) => ref.id));
    await releaseAssets(before.filter((ref) => !after.has(ref.id)));
    invalidate();
    return node;
};

const moveNode = async (id, parentId, index) => {
    const node = await Node.findById(id);
    if (!node) throw new ApiError(404, 'Item not found');

    const target = parentId ? String(parentId) : null;
    if (target) {
        if (target === String(node._id)) throw new ApiError(400, 'Cannot move an item inside itself');
        if (await Node.exists({ _id: target, ancestors: node._id })) {
            throw new ApiError(400, 'Cannot move an item inside its own descendant');
        }
    }

    const place = await resolveParent(target);
    const deepest = await Node.findOne({ ancestors: node._id }).sort({ depth: -1 }).select('depth').lean();
    const height = deepest ? deepest.depth - node.depth : 0;
    if (place.depth + height > MAX_DEPTH) throw new ApiError(400, 'Maximum nesting depth reached');

    if (String(node.parent || '') !== String(place.parent || '')) {
        node.parent = place.parent;
        node.ancestors = place.ancestors;
        node.depth = place.depth;
        await node.save();

        if (deepest) {
            await Node.updateMany({ ancestors: node._id }, [
                {
                    $set: {
                        ancestors: {
                            $concatArrays: [
                                place.ancestors,
                                {
                                    $slice: [
                                        '$ancestors',
                                        { $indexOfArray: ['$ancestors', node._id] },
                                        { $size: '$ancestors' }
                                    ]
                                }
                            ]
                        }
                    }
                },
                { $set: { depth: { $size: '$ancestors' } } }
            ]);
        }
    }

    const siblings = await Node.find({ parent: place.parent, _id: { $ne: node._id } })
        .sort({ order: 1, createdAt: 1 })
        .select('_id')
        .lean();
    const ids = siblings.map((sibling) => sibling._id);
    const position = Number.isInteger(index) ? Math.max(0, Math.min(index, ids.length)) : ids.length;
    ids.splice(position, 0, node._id);
    await reindex(ids);

    invalidate();
    return Node.findById(node._id);
};

const reorder = async (parent, ids) => {
    const siblings = await Node.find({ parent: parent || null })
        .sort({ order: 1, createdAt: 1 })
        .select('_id')
        .lean();
    const known = new Set(siblings.map((sibling) => String(sibling._id)));
    const unique = [...new Set(ids.map(String))];

    if (unique.some((id) => !known.has(id))) throw new ApiError(400, 'All items must share the same parent');

    const given = new Set(unique);
    const rest = siblings.map((sibling) => String(sibling._id)).filter((id) => !given.has(id));
    await reindex([...unique, ...rest].map((id) => new mongoose.Types.ObjectId(id)));
    invalidate();
};

const removeNode = async (id, strategy) => {
    const node = await Node.findById(id);
    if (!node) throw new ApiError(404, 'Item not found');

    const children = await Node.countDocuments({ parent: node._id });
    if (children > 0 && !['cascade', 'promote'].includes(strategy)) {
        throw new ApiError(409, 'This item contains other items', [{ field: 'children', message: String(children) }]);
    }

    if (children > 0 && strategy === 'promote') {
        const kids = await Node.find({ parent: node._id }).sort({ order: 1, createdAt: 1 }).select('_id').lean();
        for (const kid of kids) {
            await moveNode(kid._id, node.parent, undefined);
        }
    }

    const doomed =
        children > 0 && strategy === 'cascade'
            ? await Node.find({ $or: [{ _id: node._id }, { ancestors: node._id }] }).lean()
            : [node.toObject()];

    await Node.deleteMany({ _id: { $in: doomed.map((item) => item._id) } });
    await releaseAssets(doomed.flatMap(assetRefs));
    invalidate();
    return doomed.length;
};

const nextOrderFor = nextOrder;

const duplicateNode = async (id, options, adminId) => {
    const { includeChildren = false, publish = false } = options;
    const source = await Node.findById(id).lean();
    if (!source) throw new ApiError(404, 'Item not found');

    const parentId = options.parent === undefined ? source.parent : options.parent || null;
    const place = await resolveParent(parentId);
    const subtree = includeChildren
        ? await Node.find({ ancestors: source._id }).sort({ depth: 1, order: 1, createdAt: 1 }).lean()
        : [];

    if (subtree.length + 1 > MAX_DUPLICATE_NODES) {
        throw new ApiError(400, `Too many items to duplicate (max ${MAX_DUPLICATE_NODES})`);
    }
    const height = subtree.length ? Math.max(...subtree.map((item) => item.depth)) - source.depth : 0;
    if (place.depth + height > MAX_DEPTH) throw new ApiError(400, 'Maximum nesting depth reached');

    const taken = { category: new Set(), product: new Set() };
    const entries = new Map();
    const docs = [];
    const rootOrder = await nextOrderFor(place.parent);

    for (const node of [source, ...subtree]) {
        const isRoot = String(node._id) === String(source._id);
        const parentEntry = isRoot ? null : entries.get(String(node.parent));
        if (!isRoot && !parentEntry) continue;

        const _id = new mongoose.Types.ObjectId();
        const ancestors = isRoot ? place.ancestors : [...parentEntry.ancestors, parentEntry.id];
        entries.set(String(node._id), { id: _id, ancestors });

        docs.push({
            ...take(node, CLONE_FIELDS),
            options: regenerateKeys(node.options || []),
            _id,
            slug: await uniqueSlug(Node, { kind: node.kind }, node.slug, { taken: taken[node.kind] }),
            name: isRoot ? `${node.name} - نسخة`.slice(0, 200) : node.name,
            parent: isRoot ? place.parent : parentEntry.id,
            ancestors,
            depth: ancestors.length,
            order: isRoot ? rootOrder : node.order,
            isActive: isRoot ? Boolean(publish && source.isActive) : node.isActive,
            createdBy: adminId
        });
    }

    await Node.insertMany(docs);
    invalidate();
    return Node.findById(docs[0]._id);
};

const applyOptions = async (node, options, mode) => {
    const incoming = regenerateKeys(options);
    const current = mode === 'replace' ? [] : node.options.map((option) => option.toObject());
    const merged = normalizeOptions([...current, ...incoming]);

    if (merged.length > LIMITS.options) {
        throw new ApiError(400, `A product can have up to ${LIMITS.options} options`);
    }

    node.options = merged;
    await node.save();
    return node;
};

const loadAncestors = async (node) => {
    if (!node.ancestors || node.ancestors.length === 0) return [];
    const docs = await Node.find({ _id: { $in: node.ancestors } }).select('name slug kind').lean();
    const byId = new Map(docs.map((doc) => [String(doc._id), doc]));
    return node.ancestors.map((id) => byId.get(String(id))).filter(Boolean);
};

const crumbs = (docs) => docs.map(({ _id, name, slug, kind }) => ({ _id, name, slug, kind }));

const effectiveOptions = async (node) => {
    const own = (node.options || []).map((option) => ({ ...option, inheritedFrom: null }));
    if (!node.inheritOptions || !node.ancestors || node.ancestors.length === 0) return own;

    const docs = await Node.find({ _id: { $in: node.ancestors } })
        .select('name options inheritOptions')
        .lean();
    const byId = new Map(docs.map((doc) => [String(doc._id), doc]));
    const groups = [];
    let current = node;

    for (let index = node.ancestors.length - 1; index >= 0 && current.inheritOptions; index -= 1) {
        const ancestor = byId.get(String(node.ancestors[index]));
        if (!ancestor) break;
        groups.unshift(
            (ancestor.options || []).map((option) => ({
                ...option,
                inheritedFrom: { _id: ancestor._id, name: ancestor.name }
            }))
        );
        current = ancestor;
    }

    return [...groups.flat(), ...own];
};

const childCounts = async (ids, onlyActive = false) => {
    if (!ids.length) return new Map();
    const match = { parent: { $in: ids } };
    if (onlyActive) match.isActive = true;
    const rows = await Node.aggregate([{ $match: match }, { $group: { _id: '$parent', count: { $sum: 1 } } }]);
    return new Map(rows.map((row) => [String(row._id), row.count]));
};

const pathNamer = async (items) => {
    const ids = [...new Set(items.flatMap((item) => (item.ancestors || []).map(String)))];
    const docs = ids.length ? await Node.find({ _id: { $in: ids } }).select('name').lean() : [];
    const names = new Map(docs.map((doc) => [String(doc._id), doc.name]));
    return (item) => (item.ancestors || []).map((id) => names.get(String(id))).filter(Boolean);
};

const withCounts = (nodes) => {
    const direct = new Map();
    const products = new Map();

    nodes.forEach((node) => {
        if (node.parent) direct.set(String(node.parent), (direct.get(String(node.parent)) || 0) + 1);
        if (node.kind === 'product') {
            (node.ancestors || []).forEach((id) => products.set(String(id), (products.get(String(id)) || 0) + 1));
        }
    });

    return (node) => ({
        childrenCount: direct.get(String(node._id)) || 0,
        productCount: products.get(String(node._id)) || 0
    });
};

const buildTree = (nodes, decorate) => {
    const map = new Map();
    nodes.forEach((node) => map.set(String(node._id), { ...decorate(node), children: [] }));

    const roots = [];
    nodes.forEach((node) => {
        const item = map.get(String(node._id));
        if (!node.parent) roots.push(item);
        else {
            const holder = map.get(String(node.parent));
            if (holder) holder.children.push(item);
        }
    });
    return roots;
};

const buildAnswers = (options, input, base) => {
    const errors = [];
    const answers = [];

    options.forEach((option) => {
        const field = `${base}.options.${option.key}`;
        const raw = input[option.key];
        const empty =
            raw === undefined || raw === null || raw === '' || (Array.isArray(raw) && raw.length === 0);

        if (empty) {
            if (option.isRequired) errors.push({ field, message: `${option.title} is required` });
            return;
        }

        if (CHOICE_TYPES.includes(option.type)) {
            if (option.type !== 'checkbox' && Array.isArray(raw)) {
                errors.push({ field, message: `${option.title}: choose one value` });
                return;
            }
            const keys = (Array.isArray(raw) ? raw : [raw]).map(String);
            const picked = keys.map((key) => option.values.find((value) => value.key === key));
            if (picked.some((value) => !value) || new Set(keys).size !== keys.length) {
                errors.push({ field, message: `${option.title}: invalid choice` });
                return;
            }
            answers.push({
                optionKey: option.key,
                title: option.title,
                type: option.type,
                values: picked.map((value) => ({ key: value.key, label: value.label })),
                number: null,
                unit: '',
                text: '',
                display: picked.map((value) => value.label).join('، ')
            });
            return;
        }

        if (typeof raw !== 'string' && typeof raw !== 'number') {
            errors.push({ field, message: `${option.title}: invalid value` });
            return;
        }

        if (option.type === 'number') {
            const value = Number(raw);
            const hasMin = option.min !== null && option.min !== undefined;
            const hasMax = option.max !== null && option.max !== undefined;
            const hasStep = option.step !== null && option.step !== undefined && option.step > 0;
            if (!Number.isFinite(value)) {
                errors.push({ field, message: `${option.title}: enter a valid number` });
                return;
            }
            if (hasMin && value < option.min) {
                errors.push({ field, message: `${option.title}: minimum is ${option.min}` });
                return;
            }
            if (hasMax && value > option.max) {
                errors.push({ field, message: `${option.title}: maximum is ${option.max}` });
                return;
            }
            if (hasStep) {
                const steps = (value - (hasMin ? option.min : 0)) / option.step;
                if (Math.abs(steps - Math.round(steps)) > 1e-9) {
                    errors.push({ field, message: `${option.title}: must be a multiple of ${option.step}` });
                    return;
                }
            }
            answers.push({
                optionKey: option.key,
                title: option.title,
                type: option.type,
                values: [],
                number: value,
                unit: option.unit || '',
                text: '',
                display: `${value}${option.unit ? ` ${option.unit}` : ''}`
            });
            return;
        }

        const text = String(raw).trim();
        const limit = option.maxLength || (option.type === 'textarea' ? 2000 : 300);
        if (text.length > limit) {
            errors.push({ field, message: `${option.title}: maximum ${limit} characters` });
            return;
        }
        answers.push({
            optionKey: option.key,
            title: option.title,
            type: option.type,
            values: [],
            number: null,
            unit: '',
            text,
            display: text
        });
    });

    return { answers, errors };
};

module.exports = {
    invalidate,
    hiddenIds,
    publicFilter,
    findPublic,
    normalizeOptions,
    regenerateKeys,
    createNode,
    updateNode,
    moveNode,
    reorder,
    removeNode,
    duplicateNode,
    applyOptions,
    loadAncestors,
    crumbs,
    effectiveOptions,
    childCounts,
    pathNamer,
    withCounts,
    buildTree,
    buildAnswers
};