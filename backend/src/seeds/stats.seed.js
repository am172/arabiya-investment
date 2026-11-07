const Stat = require('../models/Stat.model');
const data = require('../data/arabiya.defaults');
const logger = require('../utils/logger');

const seedStats = async ({ force = false } = {}) => {
  const count = await Stat.countDocuments();
  if (count > 0 && !force) {
    logger.info('Stats already exist, skipping');
    return;
  }
  if (force) await Stat.deleteMany({});

  await Stat.insertMany(
    data.stats.map((stat, index) => ({
      label: stat.label,
      value: stat.value,
      prefix: stat.prefix || '',
      suffix: stat.suffix || '',
      icon: stat.icon || '',
      description: stat.description || '',
      order: index,
      isActive: stat.isActive !== false
    }))
  );
  logger.info('Stats seeded');
};

module.exports = seedStats;