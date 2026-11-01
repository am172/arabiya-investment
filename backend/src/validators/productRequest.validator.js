const { REQUEST_STATUSES, LIMITS } = require('../constants/catalog');

const OBJECT_ID = /^[a-f\d]{24}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const push = (errors, field, message) => errors.push({ field, message });
const str = (value, max, required = false) =>
    typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0);

const validateSubmitRequest = (body) => {
    const errors = [];

    if (!str(body.name, 120, true)) push(errors, 'name', 'Name is required');
    const digits = String(body.phone || '').replace(/\D/g, '');
    if (!str(body.phone, 40, true) || digits.length < 7 || digits.length > 15) {
        push(errors, 'phone', 'Enter a valid phone number');
    }
    if (body.email !== undefined && body.email !== '' && (!str(body.email, 150) || !EMAIL.test(body.email))) {
        push(errors, 'email', 'Enter a valid email');
    }
    [
        ['company', 150],
        ['city', 100],
        ['message', 3000],
        ['pageUrl', 300]
    ].forEach(([field, max]) => {
        if (body[field] !== undefined && !str(body[field], max)) push(errors, field, `${field} is too long`);
    });

    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > LIMITS.items) {
        push(errors, 'items', `Add between 1 and ${LIMITS.items} items`);
        return errors;
    }

    body.items.forEach((item, index) => {
        const path = `items[${index}]`;
        if (!isObject(item) || !OBJECT_ID.test(String(item.product))) {
            push(errors, `${path}.product`, 'Invalid product');
            return;
        }
        if (item.options !== undefined && !isObject(item.options)) push(errors, `${path}.options`, 'Invalid options');
        if (item.note !== undefined && !str(item.note, 500)) push(errors, `${path}.note`, 'Note is too long');
    });

    return errors;
};

const validateRequestStatus = (body) => {
    const errors = [];
    if (!REQUEST_STATUSES.includes(body.status)) push(errors, 'status', 'Invalid status');
    if (body.note !== undefined && !str(body.note, 500)) push(errors, 'note', 'Note is too long');
    return errors;
};

const validateAdminNote = (body) => {
    const errors = [];
    if (!str(body.adminNote, 2000)) push(errors, 'adminNote', 'Note must be text up to 2000 characters');
    return errors;
};

const validateBulkIds = (body) => {
    const errors = [];
    if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.length > 200 || body.ids.some((id) => !OBJECT_ID.test(String(id)))) {
        push(errors, 'ids', 'ids must be a list of up to 200 request ids');
    }
    return errors;
};

module.exports = { validateSubmitRequest, validateRequestStatus, validateAdminNote, validateBulkIds };