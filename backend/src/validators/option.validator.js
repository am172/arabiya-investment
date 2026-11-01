const { OPTION_TYPES, CHOICE_TYPES, LIMITS } = require('../constants/catalog');
const { KEY_PATTERN } = require('../utils/catalogHelpers');

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const push = (errors, field, message) => errors.push({ field, message });
const str = (value, max, required = false) =>
    typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0);
const blank = (value) => value === null || value === undefined || value === '';
const numeric = (value) => blank(value) || Number.isFinite(Number(value));

const checkOptions = (options, errors, base = 'options') => {
    if (!Array.isArray(options) || options.length > LIMITS.options) {
        push(errors, base, `${base} must be an array of up to ${LIMITS.options} items`);
        return;
    }

    options.forEach((option, index) => {
        const path = `${base}[${index}]`;
        if (!isObject(option)) {
            push(errors, path, 'Invalid option');
            return;
        }

        if (!str(option.title, 120, true)) push(errors, `${path}.title`, 'Option title is required (max 120)');
        if (!OPTION_TYPES.includes(option.type)) push(errors, `${path}.type`, 'Invalid option type');
        if (!blank(option.key) && !KEY_PATTERN.test(String(option.key))) {
            push(errors, `${path}.key`, 'Invalid option key');
        }
        if (option.isRequired !== undefined && typeof option.isRequired !== 'boolean') {
            push(errors, `${path}.isRequired`, 'isRequired must be a boolean');
        }
        if (option.helpText !== undefined && !str(option.helpText, 300)) {
            push(errors, `${path}.helpText`, 'Help text is too long');
        }
        if (option.placeholder !== undefined && !str(option.placeholder, 120)) {
            push(errors, `${path}.placeholder`, 'Placeholder is too long');
        }

        if (CHOICE_TYPES.includes(option.type)) {
            const values = option.values;
            if (!Array.isArray(values) || values.length === 0 || values.length > LIMITS.values) {
                push(errors, `${path}.values`, 'Add at least one choice');
            } else {
                let defaults = 0;
                values.forEach((value, position) => {
                    const where = `${path}.values[${position}]`;
                    if (!isObject(value) || !str(value.label, 120, true)) {
                        push(errors, `${where}.label`, 'Choice label is required');
                        return;
                    }
                    if (!blank(value.key) && !KEY_PATTERN.test(String(value.key))) {
                        push(errors, `${where}.key`, 'Invalid choice key');
                    }
                    if (value.description !== undefined && !str(value.description, 200)) {
                        push(errors, `${where}.description`, 'Description is too long');
                    }
                    if (value.isDefault === true) defaults += 1;
                });
                if (option.type !== 'checkbox' && defaults > 1) {
                    push(errors, `${path}.values`, 'Only one default choice is allowed');
                }
            }
        }

        if (option.type === 'number') {
            ['min', 'max', 'step', 'defaultNumber'].forEach((field) => {
                if (!numeric(option[field])) push(errors, `${path}.${field}`, 'Must be a number');
            });
            if (!blank(option.min) && !blank(option.max) && Number(option.min) > Number(option.max)) {
                push(errors, `${path}.min`, 'Minimum cannot exceed maximum');
            }
            if (!blank(option.step) && Number(option.step) <= 0) {
                push(errors, `${path}.step`, 'Step must be greater than zero');
            }
            if (option.unit !== undefined && !str(option.unit, 30)) push(errors, `${path}.unit`, 'Unit is too long');
        }

        if (['text', 'textarea'].includes(option.type) && !blank(option.maxLength)) {
            const length = Number(option.maxLength);
            if (!Number.isInteger(length) || length < 1 || length > 5000) {
                push(errors, `${path}.maxLength`, 'Max length must be between 1 and 5000');
            }
        }
    });
};

const validateOptionTemplate = (isCreate) => (body) => {
    const errors = [];
    if (isCreate || body.name !== undefined) {
        if (!str(body.name, 120, true)) push(errors, 'name', 'Name is required (max 120)');
    }
    if (body.description !== undefined && !str(body.description, 300)) {
        push(errors, 'description', 'Description is too long');
    }
    if (isCreate || body.options !== undefined) checkOptions(body.options, errors);
    if (!isCreate && body.name === undefined && body.description === undefined && body.options === undefined) {
        push(errors, 'body', 'No valid fields to update');
    }
    return errors;
};

module.exports = {
    checkOptions,
    validateCreateTemplate: validateOptionTemplate(true),
    validateUpdateTemplate: validateOptionTemplate(false)
};