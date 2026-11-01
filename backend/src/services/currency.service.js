const CurrencySettings = require('../models/CurrencySettings.model');
const { MAP, countriesFor } = require('../constants/countryCurrency');
const logger = require('../utils/logger');

const SOURCE = 'https://open.er-api.com/v6/latest/USD';
const STALE_MS = 12 * 60 * 60 * 1000;

let inflight = null;

const refreshRates = async () => {
    if (inflight) return inflight;

    inflight = (async () => {
        try {
            const res = await fetch(SOURCE, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) throw new Error(`Rates API responded with ${res.status}`);
            const data = await res.json();
            if (data.result !== 'success' || !data.rates) throw new Error('Rates API returned no rates');

            await CurrencySettings.getSettings();
            await CurrencySettings.updateOne(
                { key: 'main' },
                { $set: { rates: { base: 'USD', values: data.rates, fetchedAt: new Date() } } }
            );
            return true;
        } catch (error) {
            logger.warn(`Currency refresh failed: ${error.message}`);
            return false;
        } finally {
            inflight = null;
        }
    })();

    return inflight;
};

const needsAuto = (doc) => doc.secondary.some((item) => item.rateMode === 'auto');

const refreshIfStale = async (doc) => {
    if (!needsAuto(doc)) return;
    const fetchedAt = doc.rates && doc.rates.fetchedAt;
    const stale = !fetchedAt || Date.now() - fetchedAt.getTime() > STALE_MS;
    if (!stale) return;
    if (fetchedAt) refreshRates();
    else await refreshRates();
};

const effectiveRates = (doc) => {
    const values = (doc.rates && doc.rates.values) || {};
    const result = {};
    doc.secondary.forEach((item) => {
        if (item.rateMode === 'manual') {
            result[item.code] = item.manualRate || null;
        } else {
            result[item.code] = values[item.code] && values[doc.primary] ? values[item.code] / values[doc.primary] : null;
        }
    });
    return result;
};

const buildPublic = async (country) => {
    let doc = await CurrencySettings.getSettings();
    await refreshIfStale(doc);
    doc = await CurrencySettings.getSettings();

    const rates = effectiveRates(doc);
    const list = [{ code: doc.primary, rate: 1, roundTo: 0, auto: false }];
    doc.secondary.forEach((item) => {
        if (rates[item.code]) {
            list.push({ code: item.code, rate: rates[item.code], roundTo: item.roundTo, auto: item.rateMode === 'auto' });
        }
    });

    const currencies = list.map((item) => ({ ...item, countries: countriesFor(item.code) }));
    const matched = country && MAP[country] ? currencies.find((item) => item.code === MAP[country]) : null;

    return {
        primary: doc.primary,
        autoDetect: doc.autoDetect,
        currencies,
        detected: { country: country || '', currency: matched ? matched.code : '' },
        attribution: currencies.some((item) => item.auto),
        updatedAt: doc.rates ? doc.rates.fetchedAt : null
    };
};

module.exports = { refreshRates, refreshIfStale, effectiveRates, buildPublic };