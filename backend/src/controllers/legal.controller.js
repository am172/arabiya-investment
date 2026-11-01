const LegalPage = require('../models/LegalPage.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const LEGAL_SLUGS = require('../constants/legalSlugs');

const FIELDS = ['title', 'intro', 'sections'];

const resolveSlug = (value) => {
  if (!LEGAL_SLUGS.includes(value)) throw new ApiError(404, 'Page not found');
  return value;
};

const getPublicLegal = asyncHandler(async (req, res) => {
  const doc = await LegalPage.getPage(resolveSlug(req.params.slug));
  const data = {
    slug: doc.slug,
    title: doc.title,
    intro: doc.intro,
    sections: doc.sections,
    updatedAt: doc.updatedAt
  };
  res.status(200).json(new ApiResponse(200, data, 'Page fetched successfully'));
});

const getLegal = asyncHandler(async (req, res) => {
  const doc = await LegalPage.getPage(resolveSlug(req.params.slug));
  res.status(200).json(new ApiResponse(200, doc, 'Page fetched successfully'));
});

const updateLegal = asyncHandler(async (req, res) => {
  const slug = resolveSlug(req.params.slug);
  const payload = pick(req.body, FIELDS);
  if (Object.keys(payload).length === 0) throw new ApiError(400, 'No valid content provided');

  const doc = await LegalPage.replacePage(slug, payload);
  res.status(200).json(new ApiResponse(200, doc, 'Page updated successfully'));
});

const resetLegal = asyncHandler(async (req, res) => {
  const doc = await LegalPage.resetPage(resolveSlug(req.params.slug));
  res.status(200).json(new ApiResponse(200, doc, 'Page reset to defaults successfully'));
});

module.exports = { getPublicLegal, getLegal, updateLegal, resetLegal };