const { KINDS, BADGE_TONES, LIMITS } = require('../constants/catalog');
const { checkOptions } = require('./option.validator');

const OBJECT_ID = /^[a-f\d]{24}$/i;
const SLUG = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;
const URL_PATTERN = /^https?:\/\/\S+$/i;
const BULK_ACTIONS = [
    'activate',
    'deactivate',
    'feature',
    'unfeature',
    'enableRequests',
    'disableRequests',
    'delete',
    'move'
];
const CONTENT_KEYS = [
    'name',
    'slug',
    'summary',
    'description',
    'sku',
    'banner',
    'gallery',
    'badges',
    'features',
    'specs',
    'documents',
    'options',
    'inheritOptions',
    'allowOrderRequest',
    'ctaLabel',
    'seo',
    'tags',
    'isActive',
    'isFeatured'
];

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const push = (errors, field, message) => errors.push({ field, message });
const str = (value, max, required = false) =>
    typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0);
const isId = (value) => OBJECT_ID.test(String(value));
const nullableId = (value) => value === null || value === undefined || value === '' || isId(value);

const checkList = (value, field, max, errors, each) => {
    if (!Array.isArray(value) || value.length > max) {
        push(errors, field, `${field} must be an array of up to ${max} items`);
        return;
    }
    value.forEach((item, index) => each(item, `${field}[${index}]`));
};

const checkAssetField = (value, field, errors) => {
    if (!isObject(value)) {
        push(errors, field, `${field} must be an object`);
        return;
    }
    if (value.url !== undefined && value.url !== '' && !URL_PATTERN.test(String(value.url))) {
        push(errors, `${field}.url`, 'Invalid url');
    }
    if (value.publicId !== undefined && !str(value.publicId, 300)) {
        push(errors, `${field}.publicId`, 'Invalid public id');
    }
};

const checkContent = (body, errors) => {
    if (body.slug !== undefined && body.slug !== '' && (!str(body.slug, 120) || !SLUG.test(body.slug))) {
        push(errors, 'slug', 'Slug may contain letters, numbers and hyphens only');
    }

    [
        ['summary', 500],
        ['description', 20000],
        ['sku', 60],
        ['ctaLabel', 60]
    ].forEach(([field, max]) => {
        if (body[field] !== undefined && !str(body[field], max)) {
            push(errors, field, `${field} must be text up to ${max} characters`);
        }
    });

    ['isActive', 'isFeatured', 'allowOrderRequest', 'inheritOptions'].forEach((field) => {
        if (body[field] !== undefined && typeof body[field] !== 'boolean') {
            push(errors, field, `${field} must be a boolean`);
        }
    });

    if (body.banner !== undefined) checkAssetField(body.banner, 'banner', errors);

    if (body.gallery !== undefined) {
        checkList(body.gallery, 'gallery', LIMITS.gallery, errors, (item, path) => {
            if (!isObject(item) || !URL_PATTERN.test(String(item.url || ''))) {
                push(errors, `${path}.url`, 'Image url is required');
                return;
            }
            if (item.publicId !== undefined && !str(item.publicId, 300)) push(errors, `${path}.publicId`, 'Invalid public id');
            if (item.alt !== undefined && !str(item.alt, 200)) push(errors, `${path}.alt`, 'Alt text is too long');
            if (item.isCover !== undefined && typeof item.isCover !== 'boolean') {
                push(errors, `${path}.isCover`, 'isCover must be a boolean');
            }
        });
    }

    if (body.badges !== undefined) {
        checkList(body.badges, 'badges', LIMITS.badges, errors, (item, path) => {
            if (!isObject(item) || !str(item.text, 40, true)) push(errors, `${path}.text`, 'Badge text is required');
            else if (item.tone !== undefined && !BADGE_TONES.includes(item.tone)) {
                push(errors, `${path}.tone`, 'Invalid badge tone');
            }
        });
    }

    if (body.features !== undefined) {
        checkList(body.features, 'features', LIMITS.features, errors, (item, path) => {
            if (!isObject(item) || !str(item.title, 120, true)) {
                push(errors, `${path}.title`, 'Feature title is required');
                return;
            }
            if (item.text !== undefined && !str(item.text, 500)) push(errors, `${path}.text`, 'Text is too long');
            if (item.icon !== undefined && !str(item.icon, 40)) push(errors, `${path}.icon`, 'Icon is too long');
        });
    }

    if (body.specs !== undefined) {
        checkList(body.specs, 'specs', LIMITS.specs, errors, (item, path) => {
            if (!isObject(item) || !str(item.label, 120, true)) {
                push(errors, `${path}.label`, 'Specification name is required');
                return;
            }
            if (item.value !== undefined && !str(item.value, 300)) push(errors, `${path}.value`, 'Value is too long');
            if (item.group !== undefined && !str(item.group, 80)) push(errors, `${path}.group`, 'Group is too long');
        });
    }

    if (body.documents !== undefined) {
        checkList(body.documents, 'documents', LIMITS.documents, errors, (item, path) => {
            if (!isObject(item) || !str(item.title, 150, true) || !URL_PATTERN.test(String(item.url || ''))) {
                push(errors, path, 'Document title and url are required');
                return;
            }
            if (item.publicId !== undefined && !str(item.publicId, 300)) push(errors, `${path}.publicId`, 'Invalid public id');
            if (item.resourceType !== undefined && !['raw', 'image'].includes(item.resourceType)) {
                push(errors, `${path}.resourceType`, 'Invalid resource type');
            }
            if (item.bytes !== undefined && !(Number.isFinite(Number(item.bytes)) && Number(item.bytes) >= 0)) {
                push(errors, `${path}.bytes`, 'Invalid size');
            }
        });
    }

    if (body.options !== undefined) checkOptions(body.options, errors);

    if (body.seo !== undefined) {
        if (!isObject(body.seo)) push(errors, 'seo', 'seo must be an object');
        else {
            if (body.seo.title !== undefined && !str(body.seo.title, 120)) push(errors, 'seo.title', 'Title is too long');
            if (body.seo.description !== undefined && !str(body.seo.description, 320)) {
                push(errors, 'seo.description', 'Description is too long');
            }
            if (body.seo.keywords !== undefined) {
                const list = body.seo.keywords;
                if (!Array.isArray(list) || list.length > 20 || list.some((word) => !str(word, 60))) {
                    push(errors, 'seo.keywords', 'Up to 20 keywords of 60 characters');
                }
            }
        }
    }

    if (body.tags !== undefined) {
        const list = body.tags;
        if (!Array.isArray(list) || list.length > LIMITS.tags || list.some((tag) => !str(tag, 40))) {
            push(errors, 'tags', `Up to ${LIMITS.tags} tags of 40 characters`);
        }
    }
};

const validateCreateNode = (body) => {
    const errors = [];
    if (!KINDS.includes(body.kind)) push(errors, 'kind', 'kind must be category or product');
    if (!str(body.name, 200, true)) push(errors, 'name', 'Name is required (max 200)');
    if (!nullableId(body.parent)) push(errors, 'parent', 'Invalid parent id');
    if (body.order !== undefined && !Number.isInteger(body.order)) push(errors, 'order', 'order must be an integer');
    checkContent(body, errors);
    return errors;
};

const validateUpdateNode = (body) => {
    const errors = [];
    if (!CONTENT_KEYS.some((key) => body[key] !== undefined)) push(errors, 'body', 'No valid fields to update');
    if (body.name !== undefined && !str(body.name, 200, true)) push(errors, 'name', 'Name is required (max 200)');
    checkContent(body, errors);
    return errors;
};

const validateFlags = (body) => {
    const errors = [];
    const keys = ['isActive', 'isFeatured', 'allowOrderRequest'];
    if (!keys.some((key) => body[key] !== undefined)) push(errors, 'body', 'No valid fields to update');
    keys.forEach((key) => {
        if (body[key] !== undefined && typeof body[key] !== 'boolean') push(errors, key, `${key} must be a boolean`);
    });
    return errors;
};

const validateMove = (body) => {
    const errors = [];
    if (!('parent' in body) || !nullableId(body.parent)) push(errors, 'parent', 'parent must be an id or null');
    if (body.index !== undefined && !(Number.isInteger(body.index) && body.index >= 0)) {
        push(errors, 'index', 'index must be a non-negative integer');
    }
    return errors;
};

const validateReorder = (body) => {
    const errors = [];
    if (!('parent' in body) || !nullableId(body.parent)) push(errors, 'parent', 'parent must be an id or null');
    if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.length > 500 || body.ids.some((id) => !isId(id))) {
        push(errors, 'ids', 'ids must be a list of item ids');
    }
    return errors;
};

const validateDuplicate = (body) => {
    const errors = [];
    ['includeChildren', 'publish'].forEach((key) => {
        if (body[key] !== undefined && typeof body[key] !== 'boolean') push(errors, key, `${key} must be a boolean`);
    });
    if (body.parent !== undefined && !nullableId(body.parent)) push(errors, 'parent', 'Invalid parent id');
    return errors;
};

const validateApplyTemplate = (body) => {
    const errors = [];
    if (!isId(body.templateId)) push(errors, 'templateId', 'templateId is required');
    if (!['append', 'replace'].includes(body.mode)) push(errors, 'mode', 'mode must be append or replace');
    return errors;
};

const validateCopyOptions = (body) => {
    const errors = [];
    if (!isId(body.fromId)) push(errors, 'fromId', 'fromId is required');
    if (!['append', 'replace'].includes(body.mode)) push(errors, 'mode', 'mode must be append or replace');
    return errors;
};

const validateBulk = (body) => {
    const errors = [];
    if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.length > 200 || body.ids.some((id) => !isId(id))) {
        push(errors, 'ids', 'ids must be a list of up to 200 item ids');
    }
    if (!BULK_ACTIONS.includes(body.action)) push(errors, 'action', 'Unknown action');
    if (body.action === 'move' && !nullableId(body.parent)) push(errors, 'parent', 'Invalid parent id');
    if (body.strategy !== undefined && !['cascade', 'promote'].includes(body.strategy)) {
        push(errors, 'strategy', 'strategy must be cascade or promote');
    }
    return errors;
};

const validateFromNode = (body) => {
    const errors = [];
    if (!isId(body.nodeId)) push(errors, 'nodeId', 'nodeId is required');
    if (!str(body.name, 120, true)) push(errors, 'name', 'Name is required (max 120)');
    if (body.description !== undefined && !str(body.description, 300)) {
        push(errors, 'description', 'Description is too long');
    }
    return errors;
};

module.exports = {
    validateCreateNode,
    validateUpdateNode,
    validateFlags,
    validateMove,
    validateReorder,
    validateDuplicate,
    validateApplyTemplate,
    validateCopyOptions,
    validateBulk,
    validateFromNode
};