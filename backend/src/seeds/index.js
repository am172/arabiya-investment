const env = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const logger = require('../utils/logger');
const seedAdmin = require('./admin.seed');
const seedTheme = require('./theme.seed');
const seedBrand = require('./brand.seed');
const seedStats = require('./stats.seed');
const seedCatalog = require('./catalog.seed');

const SEEDERS = {
  admin: seedAdmin,
  theme: seedTheme,
  brand: seedBrand,
  stats: seedStats,
  catalog: seedCatalog
};

const run = async () => {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const requested = args.filter((arg) => !arg.startsWith('--'));
  const unknown = requested.filter((name) => !SEEDERS[name]);

  if (unknown.length > 0) {
    throw new Error(`Unknown seeder: ${unknown.join(', ')}`);
  }
  if (force && env.isProduction) {
    throw new Error('--force is not allowed in production');
  }

  const targets = requested.length > 0 ? requested : Object.keys(SEEDERS);

  await connectDB();

  for (const name of targets) {
    logger.info(`Seeding ${name}`);
    await SEEDERS[name]({ force });
  }
};

run()
  .then(async () => {
    await disconnectDB();
    logger.info('Seeding complete');
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error(`Seeding failed: ${error.message}`);
    await disconnectDB().catch(() => { });
    process.exit(1);
  });