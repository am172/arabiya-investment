const { isPlainObject, checkString, checkHasFields } = require('./common.validator');

const validateUpdateLegal = (body) => {
    const errors = [];

    checkHasFields(body, ['title', 'intro', 'sections'], errors);

    checkString(body, 'title', { nonEmpty: true, max: 120 }, errors);
    checkString(body, 'intro', { max: 1000 }, errors);

    if (body.sections !== undefined) {
        if (!Array.isArray(body.sections)) {
            errors.push({ field: 'sections', message: 'sections must be an array' });
        } else if (body.sections.length > 30) {
            errors.push({ field: 'sections', message: 'sections must not contain more than 30 items' });
        } else {
            body.sections.forEach((item, index) => {
                if (!isPlainObject(item)) {
                    errors.push({ field: `sections[${index}]`, message: 'Each section must be an object' });
                    return;
                }
                const nested = [];
                checkString(item, 'heading', { required: true, nonEmpty: true, max: 150 }, nested);
                checkString(item, 'body', { required: true, nonEmpty: true, max: 5000 }, nested);
                nested.forEach((entry) => {
                    errors.push({ field: `sections[${index}].${entry.field}`, message: entry.message });
                });
            });
        }
    }

    return errors;
};

module.exports = { validateUpdateLegal };