const SiteSettings = require('../models/SiteSettings.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const flattenObject = require('../utils/flattenObject');
const destroyAsset = require('../utils/destroyAsset');
const defaultTheme = require('../constants/defaultTheme');

const SETTINGS_FIELDS = ['siteName', 'tagline', 'logo', 'favicon', 'contact', 'socialLinks', 'seo'];
const THEME_FIELDS = ['colors', 'darkColors', 'fonts', 'borderRadius', 'mode'];

const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings();
  const data = settings.toObject();
  delete data.key;
  delete data.__v;
  res.status(200).json(new ApiResponse(200, data, 'Settings fetched successfully'));
});

const getPublicTheme = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings();
  const data = {
    siteName: settings.siteName,
    logo: settings.logo,
    favicon: settings.favicon,
    theme: settings.theme
  };
  res.status(200).json(new ApiResponse(200, data, 'Theme fetched successfully'));
});

const getSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings();
  res.status(200).json(new ApiResponse(200, settings, 'Settings fetched successfully'));
});

const updateSettings = asyncHandler(async (req, res) => {
  const payload = pick(req.body, SETTINGS_FIELDS);
  const flat = flattenObject(payload);

  if (Object.keys(flat).length === 0) {
    throw new ApiError(400, 'No valid settings provided');
  }

  const current = await SiteSettings.getSettings();
  const previousLogoId = current.logo ? current.logo.publicId : '';
  const previousFaviconId = current.favicon ? current.favicon.publicId : '';

  const updated = await SiteSettings.updateSettings(flat);

  if (payload.logo && previousLogoId && previousLogoId !== updated.logo.publicId) {
    await destroyAsset(previousLogoId);
  }
  if (payload.favicon && previousFaviconId && previousFaviconId !== updated.favicon.publicId) {
    await destroyAsset(previousFaviconId);
  }

  res.status(200).json(new ApiResponse(200, updated, 'Settings updated successfully'));
});

const updateTheme = asyncHandler(async (req, res) => {
  const payload = pick(req.body, THEME_FIELDS);
  const flat = flattenObject(payload, 'theme');

  if (Object.keys(flat).length === 0) {
    throw new ApiError(400, 'No valid theme values provided');
  }

  const updated = await SiteSettings.updateSettings(flat);
  res.status(200).json(new ApiResponse(200, updated.theme, 'Theme updated successfully'));
});

const resetTheme = asyncHandler(async (req, res) => {
  const updated = await SiteSettings.updateSettings({ theme: JSON.parse(JSON.stringify(defaultTheme)) });
  res.status(200).json(new ApiResponse(200, updated.theme, 'Theme reset to default successfully'));
});

module.exports = {
  getPublicSettings,
  getPublicTheme,
  getSettings,
  updateSettings,
  updateTheme,
  resetTheme
};