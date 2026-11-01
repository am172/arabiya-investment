const cloudinary = require('../config/cloudinary');
const env = require('../config/env');
const Settings = require('../models/CloudinarySettings.model');
const ApiError = require('../utils/ApiError');
const { decrypt } = require('../utils/crypto');

const TTL = 60 * 1000;
let cache = null;

const envCredentials = () => ({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret
});

const hasAll = (creds) => Boolean(creds.cloud_name && creds.api_key && creds.api_secret);

const resolve = async () => {
  const doc = await Settings.findOne({ key: 'main' }).select('+apiSecret').lean();

  if (doc && doc.cloudName && doc.apiKey && doc.apiSecret) {
    try {
      return {
        source: 'database',
        error: '',
        creds: { cloud_name: doc.cloudName, api_key: doc.apiKey, api_secret: decrypt(doc.apiSecret) }
      };
    } catch (error) {
      const fallback = envCredentials();
      return { source: hasAll(fallback) ? 'env' : 'none', error: 'decrypt', creds: fallback };
    }
  }

  const fallback = envCredentials();
  return { source: hasAll(fallback) ? 'env' : 'none', error: '', creds: fallback };
};

const getCredentials = async () => {
  if (cache && Date.now() - cache.at < TTL) return cache.value;
  const value = await resolve();
  cache = { at: Date.now(), value };
  return value;
};

const clearCache = () => {
  cache = null;
};

const cloudOptions = async (options = {}) => {
  const { creds } = await getCredentials();
  if (!hasAll(creds)) throw new ApiError(503, 'Media storage is not configured');
  return { ...options, ...creds, secure: true };
};

const testCredentials = async (creds) => {
  try {
    await Promise.race([
      cloudinary.api.ping({ ...creds }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000))
    ]);
    return { ok: true, message: 'Connected' };
  } catch (error) {
    const message =
      (error && error.error && error.error.message) || (error && error.message) || 'Unknown error';
    return { ok: false, message };
  }
};

module.exports = { envCredentials, hasAll, getCredentials, clearCache, cloudOptions, testCredentials };