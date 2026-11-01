const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const env = require('./config/env');
const corsOptions = require('./config/cors');
const routes = require('./routes');
const sanitize = require('./middlewares/sanitize.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

const FAST_CHANGING_PATHS = ['/theme', '/settings'];

if (env.trustProxy) app.set('trust proxy', 1);
app.disable('x-powered-by');

app.get('/healthz', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.set('Cache-Control', 'no-store');
  res.status(req.query.strict === '1' && !dbReady ? 503 : 200).json({ ok: true, db: dbReady });
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(compression());

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

app.use(express.json({ limit: env.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: env.bodyLimit }));
app.use(sanitize);

app.use('/api', apiLimiter);

app.use('/api/v1/public', (req, res, next) => {
  if (req.method === 'GET') {
    const policy = FAST_CHANGING_PATHS.includes(req.path)
      ? 'public, max-age=0, s-maxage=30, stale-while-revalidate=60'
      : 'public, max-age=60, s-maxage=60, stale-while-revalidate=300';
    res.set('Cache-Control', policy);
  } else {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({ success: true, name: 'Academy AP', version: '1.0.0' });
});

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;