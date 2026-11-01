const env = require('./env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const normalize = (value) => String(value || '').trim().replace(/\/+$/, '').toLowerCase();

const allowed = new Set(env.clientUrls.map(normalize).filter(Boolean));
const warned = new Set();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowed.has(normalize(origin))) return callback(null, true);

    if (warned.size < 50 && !warned.has(origin)) {
      warned.add(origin);
      logger.warn(`CORS blocked origin: ${origin}. Allowed: ${[...allowed].join(', ')}`);
    }
    return callback(new ApiError(403, 'Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 204
};

module.exports = corsOptions;