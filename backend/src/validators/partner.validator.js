const OBJECT_ID = /^[a-f\d]{24}$/i;
const LINK = /^(https?:\/\/\S+|\/\S*)$/i;
const URL_PATTERN = /^https?:\/\/\S+$/i;
const FIELDS = ['name', 'image', 'url', 'isActive'];

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const push = (errors, field, message) => errors.push({ field, message });

const check = (body, errors, isCreate) => {
    if (body.image !== undefined || isCreate) {
        const image = body.image;
        if (!isObject(image) || !URL_PATTERN.test(String(image.url || ''))) {
            push(errors, 'image', 'The logo is required');
        } else if (image.publicId !== undefined && !(typeof image.publicId === 'string' && image.publicId.length <= 300)) {
            push(errors, 'image.publicId', 'Invalid public id');
        }
    }

    if (body.name !== undefined && !(typeof body.name === 'string' && body.name.length <= 100)) {
        push(errors, 'name', 'Name must be up to 100 characters');
    }

    if (body.url !== undefined) {
        const value = body.url;
        if (typeof value !== 'string' || value.length > 300 || (value.trim() !== '' && !LINK.test(value.trim()))) {
            push(errors, 'url', 'Use a full https:// link or a /path');
        }
    }

    if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
        push(errors, 'isActive', 'isActive must be a boolean');
    }
};

const validateCreatePartner = (body) => {
    const errors = [];
    check(body, errors, true);
    return errors;
};

const validateUpdatePartner = (body) => {
    const errors = [];
    if (!FIELDS.some((field) => body[field] !== undefined)) push(errors, 'body', 'No valid fields to update');
    check(body, errors, false);
    return errors;
};

const validateReorderPartners = (body) => {
    const errors = [];
    if (
        !Array.isArray(body.ids) ||
        body.ids.length === 0 ||
        body.ids.length > 200 ||
        body.ids.some((id) => !OBJECT_ID.test(String(id)))
    ) {
        push(errors, 'ids', 'ids must be a list of partner ids');
    }
    return errors;
};

module.exports = { validateCreatePartner, validateUpdatePartner, validateReorderPartners };