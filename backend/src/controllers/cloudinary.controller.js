const Settings = require('../models/CloudinarySettings.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { encrypt, decrypt } = require('../utils/crypto');
const {
  envCredentials,
  hasAll,
  getCredentials,
  clearCache,
  testCredentials
} = require('../services/cloudinary.service');

const mask = (value) => (value ? `${value.slice(0, 3)}••••${value.slice(-2)}` : '');

const stored = () => Settings.findOne({ key: 'main' }).select('+apiSecret').lean();

const present = async () => {
  const doc = await stored();
  const { source, error } = await getCredentials();
  return {
    source,
    error,
    cloudName: doc ? doc.cloudName : '',
    apiKeyMasked: doc ? mask(doc.apiKey) : '',
    hasSecret: Boolean(doc && doc.apiSecret),
    envAvailable: hasAll(envCredentials()),
    updatedAt: doc ? doc.updatedAt : null
  };
};

const resolveInput = async (body) => {
  const doc = await stored();
  const cloudName = String(body.cloudName || '').trim() || (doc && doc.cloudName) || '';
  const apiKey = String(body.apiKey || '').trim() || (doc && doc.apiKey) || '';
  let apiSecret = String(body.apiSecret || '').trim();

  if (!apiSecret && doc && doc.apiSecret) {
    try {
      apiSecret = decrypt(doc.apiSecret);
    } catch (error) {
      apiSecret = '';
    }
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(400, 'Cloud name, API key and API secret are all required');
  }
  return { cloudName, apiKey, apiSecret };
};

const toCreds = (input) => ({
  cloud_name: input.cloudName,
  api_key: input.apiKey,
  api_secret: input.apiSecret
});

const getStatus = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, await present(), 'Status fetched successfully'));
});

const test = asyncHandler(async (req, res) => {
  const result = await testCredentials(toCreds(await resolveInput(req.body)));
  res.status(200).json(new ApiResponse(200, result, result.ok ? 'Connected' : 'Connection failed'));
});

const save = asyncHandler(async (req, res) => {
  const input = await resolveInput(req.body);
  const result = await testCredentials(toCreds(input));
  if (!result.ok) throw new ApiError(400, `Connection failed: ${result.message}`);

  await Settings.findOneAndUpdate(
    { key: 'main' },
    {
      $set: {
        cloudName: input.cloudName,
        apiKey: input.apiKey,
        apiSecret: encrypt(input.apiSecret)
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  clearCache();

  res.status(200).json(new ApiResponse(200, await present(), 'Cloudinary connected and saved'));
});

const remove = asyncHandler(async (req, res) => {
  await Settings.deleteOne({ key: 'main' });
  clearCache();
  res.status(200).json(new ApiResponse(200, await present(), 'Cloudinary settings removed'));
});

module.exports = { getStatus, test, save, remove };