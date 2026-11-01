const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const toList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: toList(process.env.CLIENT_URLS || 'http://localhost:3000,http://localhost:5173'),
  trustProxy: process.env.TRUST_PROXY === 'true',
  bodyLimit: process.env.BODY_LIMIT || '2mb',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  }
});