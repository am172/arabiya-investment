import uid from './uid';
import { CHOICE_TYPES } from '../constants/catalog';

const text = (value) => (value === null || value === undefined ? '' : String(value));
const num = (value) => (value === '' || value === null || value === undefined ? null : Number(value));
const split = (value) =>
    text(value)
        .split(/[,،]/)
        .map((item) => item.trim())
        .filter(Boolean);

export const thumb = (url, width = 400) =>
    url && url.includes('/upload/') ? url.replace('/upload/', `/upload/w_${width},c_limit,f_auto,q_auto/`) : url || '';

export const emptyValue = () => ({ _uid: uid(), key: '', label: '', description: '', isDefault: false });

export const emptyOption = (type = 'select') => ({
    _uid: uid(),
    key: '',
    title: '',
    type,
    isRequired: false,
    helpText: '',
    placeholder: '',
    values: CHOICE_TYPES.includes(type) ? [emptyValue(), emptyValue()] : [],
    min: '',
    max: '',
    step: '',
    unit: '',
    defaultNumber: '',
    maxLength: ''
});

export const optionsToForm = (options = []) =>
    (options || []).map((option) => ({
        _uid: uid(),
        key: option.key || '',
        title: text(option.title),
        type: option.type,
        isRequired: Boolean(option.isRequired),
        helpText: text(option.helpText),
        placeholder: text(option.placeholder),
        values: (option.values || []).map((value) => ({
            _uid: uid(),
            key: value.key || '',
            label: text(value.label),
            description: text(value.description),
            isDefault: Boolean(value.isDefault)
        })),
        min: text(option.min),
        max: text(option.max),
        step: text(option.step),
        unit: text(option.unit),
        defaultNumber: text(option.defaultNumber),
        maxLength: text(option.maxLength)
    }));

export const freshOptions = (options) =>
    optionsToForm(options).map((option) => ({
        ...option,
        key: '',
        values: option.values.map((value) => ({ ...value, key: '' }))
    }));

export const optionsToPayload = (options) =>
    options.map((option) => {
        const payload = {
            title: option.title.trim(),
            type: option.type,
            isRequired: option.isRequired,
            helpText: option.helpText.trim(),
            placeholder: option.placeholder.trim()
        };
        if (option.key) payload.key = option.key;
        if (CHOICE_TYPES.includes(option.type)) {
            payload.values = option.values
                .filter((value) => value.label.trim())
                .map((value) => ({
                    ...(value.key ? { key: value.key } : {}),
                    label: value.label.trim(),
                    description: value.description.trim(),
                    isDefault: value.isDefault
                }));
        }
        if (option.type === 'number') {
            Object.assign(payload, {
                min: num(option.min),
                max: num(option.max),
                step: num(option.step),
                unit: option.unit.trim(),
                defaultNumber: num(option.defaultNumber)
            });
        }
        if (option.type === 'text' || option.type === 'textarea') payload.maxLength = num(option.maxLength);
        return payload;
    });

export const previewOptions = (options) =>
    options
        .filter((option) => option.title.trim())
        .map((option) => ({
            key: option.key || option._uid,
            title: option.title.trim(),
            type: option.type,
            isRequired: option.isRequired,
            helpText: option.helpText,
            placeholder: option.placeholder,
            values: option.values
                .filter((value) => value.label.trim())
                .map((value) => ({ key: value.key || value._uid, label: value.label.trim(), isDefault: value.isDefault })),
            min: num(option.min),
            max: num(option.max),
            step: num(option.step),
            unit: option.unit,
            defaultNumber: num(option.defaultNumber)
        }));

export const nodeToForm = (node, defaults = {}) => {
    const kind = node ? node.kind : defaults.kind || 'product';
    const seo = (node && node.seo) || {};
    const banner = (node && node.banner) || {};

    return {
        kind,
        parent: node ? node.parent || '' : defaults.parent || '',
        name: text(node && node.name),
        slug: text(node && node.slug),
        summary: text(node && node.summary),
        description: text(node && node.description),
        sku: text(node && node.sku),
        ctaLabel: text(node && node.ctaLabel),
        isActive: node ? Boolean(node.isActive) : false,
        isFeatured: node ? Boolean(node.isFeatured) : false,
        allowOrderRequest: node ? Boolean(node.allowOrderRequest) : kind === 'product',
        inheritOptions: node ? Boolean(node.inheritOptions) : false,
        banner: { url: text(banner.url), publicId: text(banner.publicId) },
        gallery: ((node && node.gallery) || []).map((item) => ({
            _uid: uid(),
            url: item.url,
            publicId: text(item.publicId),
            alt: text(item.alt),
            isCover: Boolean(item.isCover)
        })),
        badges: ((node && node.badges) || []).map((item) => ({ _uid: uid(), text: text(item.text), tone: item.tone || 'primary' })),
        features: ((node && node.features) || []).map((item) => ({
            _uid: uid(),
            icon: item.icon || 'sparkles',
            title: text(item.title),
            text: text(item.text)
        })),
        specs: ((node && node.specs) || []).map((item) => ({
            _uid: uid(),
            group: text(item.group),
            label: text(item.label),
            value: text(item.value)
        })),
        documents: ((node && node.documents) || []).map((item) => ({
            _uid: uid(),
            title: text(item.title),
            url: item.url,
            publicId: text(item.publicId),
            resourceType: item.resourceType || 'raw',
            format: item.format || 'pdf',
            bytes: Number(item.bytes) || 0
        })),
        options: optionsToForm((node && node.options) || []),
        seo: {
            title: text(seo.title),
            description: text(seo.description),
            keywords: (seo.keywords || []).join(', ')
        },
        tags: ((node && node.tags) || []).join(', ')
    };
};

export const nodeToPayload = (form, isCreate) => {
    const payload = {
        name: form.name.trim(),
        summary: form.summary.trim(),
        description: form.description.trim(),
        sku: form.sku.trim(),
        ctaLabel: form.ctaLabel.trim(),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        allowOrderRequest: form.allowOrderRequest,
        inheritOptions: form.inheritOptions,
        banner: { url: form.banner.url, publicId: form.banner.publicId },
        gallery: form.gallery.map((item) => ({
            url: item.url,
            publicId: item.publicId,
            alt: item.alt.trim(),
            isCover: item.isCover
        })),
        badges: form.badges.filter((item) => item.text.trim()).map((item) => ({ text: item.text.trim(), tone: item.tone })),
        features: form.features
            .filter((item) => item.title.trim() || item.text.trim())
            .map((item) => ({ icon: item.icon, title: item.title.trim(), text: item.text.trim() })),
        specs: form.specs
            .filter((item) => item.label.trim() || item.value.trim())
            .map((item) => ({ group: item.group.trim(), label: item.label.trim(), value: item.value.trim() })),
        documents: form.documents.map((item) => ({
            title: item.title.trim(),
            url: item.url,
            publicId: item.publicId,
            resourceType: item.resourceType,
            format: item.format,
            bytes: item.bytes
        })),
        options: optionsToPayload(form.options),
        seo: {
            title: form.seo.title.trim(),
            description: form.seo.description.trim(),
            keywords: split(form.seo.keywords)
        },
        tags: split(form.tags)
    };

    if (form.slug.trim()) payload.slug = form.slug.trim();
    if (isCreate) {
        payload.kind = form.kind;
        payload.parent = form.parent || null;
    }
    return payload;
};

export const findNode = (tree, id) => {
    for (const node of tree) {
        if (node._id === id) return node;
        const found = findNode(node.children, id);
        if (found) return found;
    }
    return null;
};

export const collectIds = (node, ids = new Set()) => {
    ids.add(node._id);
    node.children.forEach((child) => collectIds(child, ids));
    return ids;
};

export const flattenTree = (tree, depth = 0, rows = []) => {
    tree.forEach((node) => {
        rows.push({ node, depth });
        flattenTree(node.children, depth + 1, rows);
    });
    return rows;
};

export const filterTree = (nodes, needle) =>
    nodes
        .map((node) => ({ ...node, children: filterTree(node.children, needle) }))
        .filter((node) => node.children.length > 0 || node.name.toLowerCase().includes(needle));

export const siblingsOf = (tree, node) => {
    if (!node.parent) return tree;
    const parent = findNode(tree, node.parent);
    return parent ? parent.children : tree;
};