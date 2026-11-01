const CurrencySettings = require('../models/CurrencySettings.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const { resolveGeo } = require('../utils/analytics');
const service = require('../services/currency.service');

const present = (doc) => ({
    primary: doc.primary,
    autoDetect: doc.autoDetect,
    secondary: doc.secondary,
    ratesUpdatedAt: doc.rates ? doc.rates.fetchedAt : null,
    effective: service.effectiveRates(doc)
});

const getPublicCurrencies = asyncHandler(async (req, res) => {
    const geo = resolveGeo(req.headers, req.ip);
    const data = await service.buildPublic(geo.country);
    res.set('Cache-Control', 'private, no-store');
    res.status(200).json(new ApiResponse(200, data, 'Currencies fetched successfully'));
});

const getCurrencySettings = asyncHandler(async (req, res) => {
    const doc = await CurrencySettings.getSettings();
    await service.refreshIfStale(doc);
    res.status(200).json(new ApiResponse(200, present(await CurrencySettings.getSettings()), 'Settings fetched successfully'));
});

const updateCurrencySettings = asyncHandler(async (req, res) => {
    await CurrencySettings.getSettings();
    const payload = pick(req.body, ['primary', 'autoDetect', 'secondary']);

    if (payload.secondary) {
        payload.secondary = payload.secondary.map((item) => ({
            code: item.code,
            rateMode: item.rateMode,
            manualRate: item.rateMode === 'manual' ? Number(item.manualRate) : null,
            roundTo: Number(item.roundTo)
        }));
    }

    const doc = await CurrencySettings.findOneAndUpdate(
        { key: 'main' },
        { $set: payload },
        { new: true, runValidators: true }
    );
    await service.refreshIfStale(doc);
    res.status(200).json(new ApiResponse(200, present(await CurrencySettings.getSettings()), 'Settings updated successfully'));
});

const refreshCurrencyRates = asyncHandler(async (req, res) => {
    const ok = await service.refreshRates();
    const doc = await CurrencySettings.getSettings();
    res
        .status(ok ? 200 : 502)
        .json(new ApiResponse(ok ? 200 : 502, present(doc), ok ? 'Rates refreshed' : 'Could not refresh rates'));
});

module.exports = {
    getPublicCurrencies,
    getCurrencySettings,
    updateCurrencySettings,
    refreshCurrencyRates
};