const LandingContent = require('../models/LandingContent.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const flattenObject = require('../utils/flattenObject');
const destroyAsset = require('../utils/destroyAsset');

const FIELDS = ['hero', 'sections', 'features', 'steps', 'subjects', 'faqs', 'story'];
const NESTED = ['hero', 'story'];
const HERO_IMAGES = ['image', 'bannerImage'];

const toPublic = (doc) => {
  const data = doc.toObject();
  return {
    hero: data.hero,
    sections: data.sections,
    features: data.features,
    steps: data.steps,
    subjects: data.subjects,
    faqs: data.faqs,
    story: data.story
  };
};

const imageId = (hero, key) => (hero && hero[key] && hero[key].publicId) || '';

const getPublicContent = asyncHandler(async (req, res) => {
  const doc = await LandingContent.getContent();
  res.status(200).json(new ApiResponse(200, toPublic(doc), 'Content fetched successfully'));
});

const getContent = asyncHandler(async (req, res) => {
  const doc = await LandingContent.getContent();
  res.status(200).json(new ApiResponse(200, doc, 'Content fetched successfully'));
});

const updateContent = asyncHandler(async (req, res) => {
  const payload = pick(req.body, FIELDS);
  const update = { ...payload };

  NESTED.forEach((key) => {
    if (payload[key]) {
      delete update[key];
      Object.assign(update, flattenObject(payload[key], key));
    }
  });

  if (Object.keys(update).length === 0) throw new ApiError(400, 'No valid content provided');

  const previous = {};
  if (payload.hero) {
    const before = await LandingContent.getContent();
    HERO_IMAGES.forEach((key) => {
      if (payload.hero[key]) previous[key] = imageId(before.hero, key);
    });
  }

  const doc = await LandingContent.replaceContent(update);

  for (const key of Object.keys(previous)) {
    const old = previous[key];
    if (old && old !== imageId(doc.hero, key)) await destroyAsset(old);
  }

  res.status(200).json(new ApiResponse(200, doc, 'Content updated successfully'));
});

const resetContent = asyncHandler(async (req, res) => {
  const doc = await LandingContent.resetContent();
  res.status(200).json(new ApiResponse(200, doc, 'Content reset to defaults successfully'));
});

module.exports = { getPublicContent, getContent, updateContent, resetContent };