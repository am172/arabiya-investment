const { isPlainObject } = require('./common.validator');
const TEXT_GROUPS = require('../constants/textRegistry');

const KEYS = new Set(TEXT_GROUPS.flatMap((group) => group.fields.map((field) => field[0])));

const validateUpdateTexts = (body) => {
    if (!isPlainObject(body.values)) {
        return [{ field: 'values', message: 'values must be an object' }];
    }

    const errors = [];
    Object.entries(body.values).forEach(([key, value]) => {
        if (!KEYS.has(key)) {
            errors.push({ field: key, message: `Unknown text key: ${key}` });
        } else if (typeof value !== 'string' || value.length > 1000) {
            errors.push({ field: key, message: 'Must be a string up to 1000 characters' });
        }
    });
    return errors;
};

module.exports = { validateUpdateTexts, KEYS };