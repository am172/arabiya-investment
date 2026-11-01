const crypto = require('crypto');
const geoip = require('../services/geoip.service');
const env = require('../config/env');

const secret = process.env.ANALYTICS_SALT || env.jwtSecret;

const COUNTRY_HEADERS = [
    'cf-ipcountry',
    'x-vercel-ip-country',
    'cloudfront-viewer-country',
    'x-appengine-country',
    'x-country-code'
];
const CITY_HEADERS = ['cf-ipcity', 'x-vercel-ip-city', 'x-appengine-city'];
const UNKNOWN_CODES = ['XX', 'T1', 'ZZ'];
const COUNTRY_CODE = /^[A-Z]{2}$/;

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

const ownHosts = new Set(
    env.clientUrls
        .map((url) => {
            try {
                return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
            } catch (error) {
                return '';
            }
        })
        .filter(Boolean)
);

const hmac = (value) =>
    crypto.createHmac('sha256', secret).update(String(value)).digest('hex').slice(0, 32);

const hashSession = (sessionId) => hmac(`session:${sessionId}`);

const hashVisitor = (ip, userAgent) =>
    hmac(`visitor:${ip}|${userAgent}|${new Date().toISOString().slice(0, 10)}`);

const cleanText = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const normalizePath = (value) => {
    let path = String(value || '/').split('#')[0].split('?')[0].trim();
    if (!path.startsWith('/')) path = `/${path}`;
    if (path.length > 1) path = path.replace(/\/+$/, '') || '/';
    return path.slice(0, 300);
};

const parseReferrer = (value) => {
    const empty = { url: '', host: '' };
    if (!value || typeof value !== 'string') return empty;
    try {
        const parsed = new URL(value);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return empty;
        const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
        if (!host || ownHosts.has(host)) return empty;
        return { url: `${parsed.origin}${parsed.pathname}`.slice(0, 300), host: host.slice(0, 120) };
    } catch (error) {
        return empty;
    }
};

const resolveSource = (utmSource, host) => utmSource || host || 'Direct';

const firstHeader = (headers, names) => {
    for (const name of names) {
        const value = headers[name];
        if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return '';
};

const decodeHeader = (value) => {
    try {
        return decodeURIComponent(value);
    } catch (error) {
        return '';
    }
};

const normalizeIp = (value) => {
    const ip = String(value || '').trim();
    return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
};

const lookupIp = (value) => {
    const ip = normalizeIp(value);
    if (!ip) return null;
    try {
        return geoip.lookup(ip);
    } catch (error) {
        return null;
    }
};

const resolveGeo = (headers, ip) => {
    let code = firstHeader(headers, COUNTRY_HEADERS).toUpperCase();
    let city = decodeHeader(firstHeader(headers, CITY_HEADERS));

    if (!COUNTRY_CODE.test(code) || UNKNOWN_CODES.includes(code)) code = '';

    if (!code || !city) {
        const found = lookupIp(ip);
        if (found && COUNTRY_CODE.test(found.country || '')) {
            if (!code) code = found.country;
            if (!city && found.country === code) city = found.city || '';
        }
    }

    let countryName = 'Unknown';
    if (code) {
        try {
            countryName = regionNames.of(code) || code;
        } catch (error) {
            countryName = code;
        }
    }

    return { country: code, countryName, city: city.slice(0, 100) };
};

module.exports = {
    hashSession,
    hashVisitor,
    cleanText,
    normalizePath,
    parseReferrer,
    resolveSource,
    resolveGeo
};