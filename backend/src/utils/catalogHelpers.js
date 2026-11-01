const crypto = require('crypto');

const KEY_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;

const makeKey = (prefix) => `${prefix}_${crypto.randomBytes(4).toString('hex')}`;

const take = (source, keys) =>
    keys.reduce(
        (acc, key) => (source && source[key] !== undefined ? { ...acc, [key]: source[key] } : acc),
        {}
    );

const numberOrNull = (value) =>
    value === null || value === undefined || value === '' ? null : Number(value);

module.exports = { KEY_PATTERN, makeKey, take, numberOrNull };