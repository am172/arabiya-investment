const ApiError = require('./ApiError');

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MAX_BUCKETS = 1500;
const MAX_CUSTOM_DAYS = 731;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const PRESETS = [
    'today',
    'yesterday',
    'last7days',
    'last30days',
    'last90days',
    'thismonth',
    'all',
    'custom'
];

const isValidTimezone = (value) => {
    if (typeof value !== 'string' || value.length > 64) return false;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: value });
        return true;
    } catch (error) {
        return false;
    }
};

const resolveTimezone = (value) => (isValidTimezone(value) ? value : 'UTC');

const getParts = (date, timezone) =>
    new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
        .formatToParts(date)
        .reduce((acc, part) => {
            if (part.type !== 'literal') acc[part.type] = part.value;
            return acc;
        }, {});

const offsetMs = (date, timezone) => {
    const p = getParts(date, timezone);
    const asUtc = Date.UTC(
        Number(p.year),
        Number(p.month) - 1,
        Number(p.day),
        Number(p.hour),
        Number(p.minute),
        Number(p.second)
    );
    return asUtc - Math.floor(date.getTime() / 1000) * 1000;
};

const zonedMidnight = (year, month, day, timezone) => {
    const base = Date.UTC(year, month, day);
    const first = base - offsetMs(new Date(base), timezone);
    return new Date(base - offsetMs(new Date(first), timezone));
};

const zonedDate = (date, timezone) => {
    const p = getParts(date, timezone);
    return { year: Number(p.year), month: Number(p.month) - 1, day: Number(p.day) };
};

const startOfDay = (date, timezone) => {
    const { year, month, day } = zonedDate(date, timezone);
    return zonedMidnight(year, month, day, timezone);
};

const addDays = (date, amount, timezone) => {
    const { year, month, day } = zonedDate(date, timezone);
    return zonedMidnight(year, month, day + amount, timezone);
};

const parseDay = (value, field) => {
    const match = DATE_ONLY.exec(String(value || ''));
    if (!match) throw new ApiError(400, `${field} must use the YYYY-MM-DD format`);
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const check = new Date(Date.UTC(year, month, day));
    if (check.getUTCMonth() !== month || check.getUTCDate() !== day) {
        throw new ApiError(400, `${field} is not a valid date`);
    }
    return { year, month, day };
};

const resolveRange = (query, timezone) => {
    const now = new Date();
    const limit = new Date(now.getTime() + 1);
    const hasCustom = Boolean(query.startDate || query.endDate);
    const key = hasCustom && !query.range ? 'custom' : query.range || 'last7days';

    if (!PRESETS.includes(key)) {
        throw new ApiError(400, `range must be one of: ${PRESETS.join(', ')}`);
    }

    let start;
    let end = limit;

    switch (key) {
        case 'today':
            start = startOfDay(now, timezone);
            break;
        case 'yesterday':
            start = addDays(now, -1, timezone);
            end = startOfDay(now, timezone);
            break;
        case 'last7days':
            start = addDays(now, -6, timezone);
            break;
        case 'last30days':
            start = addDays(now, -29, timezone);
            break;
        case 'last90days':
            start = addDays(now, -89, timezone);
            break;
        case 'thismonth': {
            const { year, month } = zonedDate(now, timezone);
            start = zonedMidnight(year, month, 1, timezone);
            break;
        }
        case 'all':
            start = null;
            break;
        default: {
            if (!query.startDate) throw new ApiError(400, 'startDate is required for a custom range');
            const from = parseDay(query.startDate, 'startDate');
            start = zonedMidnight(from.year, from.month, from.day, timezone);
            const to = query.endDate ? parseDay(query.endDate, 'endDate') : zonedDate(now, timezone);
            end = zonedMidnight(to.year, to.month, to.day + 1, timezone);
            if (end > limit) end = limit;
            if (start >= end) throw new ApiError(400, 'startDate must be before endDate');
            if ((end.getTime() - start.getTime()) / DAY_MS > MAX_CUSTOM_DAYS) {
                throw new ApiError(400, `Custom ranges are limited to ${MAX_CUSTOM_DAYS} days`);
            }
        }
    }

    return { key, start, end, timezone };
};

const getGranularity = (start, end) => {
    const span = end.getTime() - start.getTime();
    if (span <= 2 * DAY_MS) return 'hour';
    if (span <= 120 * DAY_MS) return 'day';
    return 'month';
};

const bucketKey = (date, timezone, granularity) => {
    const p = getParts(date, timezone);
    if (granularity === 'month') return `${p.year}-${p.month}`;
    if (granularity === 'hour') return `${p.year}-${p.month}-${p.day}T${p.hour}:00`;
    return `${p.year}-${p.month}-${p.day}`;
};

const buildBuckets = (start, end, granularity, timezone) => {
    const keys = [];
    const seen = new Set();
    let cursor = start;

    while (cursor < end && keys.length < MAX_BUCKETS) {
        const key = bucketKey(cursor, timezone, granularity);
        if (!seen.has(key)) {
            seen.add(key);
            keys.push(key);
        }

        if (granularity === 'hour') {
            cursor = new Date(cursor.getTime() + HOUR_MS);
        } else if (granularity === 'day') {
            cursor = addDays(cursor, 1, timezone);
        } else {
            const { year, month } = zonedDate(cursor, timezone);
            cursor = zonedMidnight(year, month + 1, 1, timezone);
        }
    }

    return keys;
};

module.exports = {
    resolveTimezone,
    resolveRange,
    getGranularity,
    buildBuckets,
    startOfDay
};