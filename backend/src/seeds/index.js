const env = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const logger = require('../utils/logger');
const seedAdmin = require('./admin.seed');
const seedSettings = require('./settings.seed');
const seedContent = require('./content.seed');
const seedLegal = require('./legal.seed');
const seedTexts = require('./texts.seed');
const seedStats = require('./stats.seed');
const seedBranches = require('./branches.seed');
const seedPartners = require('./partners.seed');
const seedCatalog = require('./catalog.seed');

const SEEDERS = {
  admin: seedAdmin,
  settings: seedSettings,
  content: seedContent,
  legal: seedLegal,
  texts: seedTexts,
  stats: seedStats,
  branches: seedBranches,
  partners: seedPartners,
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
  if (force && process.env.ALLOW_FORCE_SEED !== 'yes') {
    throw new Error('--force overwrites existing data. Set ALLOW_FORCE_SEED=yes to confirm');
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
    await disconnectDB().catch(() => {});
    process.exit(1);
  });