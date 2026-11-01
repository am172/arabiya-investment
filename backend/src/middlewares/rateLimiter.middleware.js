const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const handler = (req, res) => {
  res.status(429).json({
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later',
    errors: []
  });
};

const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.originalUrl.startsWith('/api/v1/analytics/track'),
  handler
});

const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler
});

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res) => res.status(204).end()
});

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler
});

const sendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler
});
module.exports = { apiLimiter, authLimiter, contactLimiter, trackLimiter, verifyLimiter, sendLimiter };