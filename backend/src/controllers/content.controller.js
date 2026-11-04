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
  const hero = { ...data.hero, slides: (data.hero.slides || []).filter((slide) => slide.isActive !== false) };
  return {
    hero,
    sections: data.sections,
    features: data.features,
    steps: data.steps,
    subjects: data.subjects,
    faqs: data.faqs,
    story: data.story
  };
};

const imageId = (hero, key) => (hero && hero[key] && hero[key].publicId) || '';

const slideAssets = (hero) =>
  ((hero && hero.slides) || [])
    .flatMap((slide) => [slide.image && slide.image.publicId, slide.logo && slide.logo.publicId])
    .filter(Boolean);

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

  let before = null;
  if (payload.hero) before = (await LandingContent.getContent()).toObject();

  const doc = await LandingContent.replaceContent(update);

  if (before) {
    for (const key of HERO_IMAGES) {
      if (!payload.hero[key]) continue;
      const old = imageId(before.hero, key);
      if (old && old !== imageId(doc.hero, key)) await destroyAsset(old);
    }

    if (payload.hero.slides !== undefined) {
      const used = new Set([
        ...slideAssets(doc.toObject().hero),
        imageId(doc.hero, 'image'),
        imageId(doc.hero, 'bannerImage')
      ]);
      for (const id of new Set(slideAssets(before.hero))) {
        if (!used.has(id)) await destroyAsset(id);
      }
    }
  }

  res.status(200).json(new ApiResponse(200, doc, 'Content updated successfully'));
});

const resetContent = asyncHandler(async (req, res) => {
  const doc = await LandingContent.resetContent();
  res.status(200).json(new ApiResponse(200, doc, 'Content reset to defaults successfully'));
});

module.exports = { getPublicContent, getContent, updateContent, resetContent };