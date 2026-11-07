const SiteText = require('../models/SiteText.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const TEXT_GROUPS = require('../constants/textRegistry');
const { KEYS } = require('../validators/text.validator');

const sanitize = (input) =>
    Object.keys(input || {}).reduce((acc, key) => {
        const value = input[key];
        if (KEYS.has(key) && typeof value === 'string' && value.trim()) {
            acc[key] = value.trim().slice(0, 1000);
        }
        return acc;
    }, {});

const present = (doc) => ({ groups: TEXT_GROUPS, values: sanitize(doc.values) });

const getPublicTexts = asyncHandler(async (req, res) => {
    const doc = await SiteText.getTexts();
    res.status(200).json(new ApiResponse(200, doc.values || {}, 'Texts fetched successfully'));
});

const getTexts = asyncHandler(async (req, res) => {
    const doc = await SiteText.getTexts();
    res.status(200).json(new ApiResponse(200, present(doc), 'Texts fetched successfully'));
});

const updateTexts = asyncHandler(async (req, res) => {
    const doc = await SiteText.replaceTexts(sanitize(req.body.values));
    res.status(200).json(new ApiResponse(200, present(doc), 'Texts updated successfully'));
});

const resetTexts = asyncHandler(async (req, res) => {
    const doc = await SiteText.replaceTexts({});
    res.status(200).json(new ApiResponse(200, present(doc), 'Texts reset successfully'));
});

module.exports = { getPublicTexts, getTexts, updateTexts, resetTexts };