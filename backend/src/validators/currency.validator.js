const { isPlainObject, checkBoolean, checkHasFields } = require('./common.validator');

const CODE = /^[A-Z]{3}$/;
const ROUND = [0, 1, 5, 10, 50, 100];

const validateUpdateCurrency = (body) => {
    const errors = [];
    checkHasFields(body, ['primary', 'autoDetect', 'secondary'], errors);
    checkBoolean(body, 'autoDetect', errors);

    if (body.primary !== undefined && !CODE.test(String(body.primary))) {
        errors.push({ field: 'primary', message: 'primary must be a 3-letter currency code' });
    }

    if (body.secondary !== undefined) {
        if (!Array.isArray(body.secondary) || body.secondary.length > 10) {
            errors.push({ field: 'secondary', message: 'secondary must be an array of up to 10 currencies' });
            return errors;
        }
        const seen = new Set();
        body.secondary.forEach((item, index) => {
            const base = `secondary[${index}]`;
            if (!isPlainObject(item) || !CODE.test(String(item.code))) {
                errors.push({ field: `${base}.code`, message: 'Invalid currency code' });
                return;
            }
            if (item.code === body.primary || seen.has(item.code)) {
                errors.push({ field: `${base}.code`, message: 'Duplicate currency' });
            }
            seen.add(item.code);
            if (!['auto', 'manual'].includes(item.rateMode)) {
                errors.push({ field: `${base}.rateMode`, message: 'rateMode must be auto or manual' });
            }
            if (item.rateMode === 'manual' && !(Number(item.manualRate) > 0)) {
                errors.push({ field: `${base}.manualRate`, message: 'Enter a rate greater than zero' });
            }
            if (!ROUND.includes(Number(item.roundTo))) {
                errors.push({ field: `${base}.roundTo`, message: 'Invalid rounding' });
            }
        });
    }

    return errors;
};

module.exports = { validateUpdateCurrency };