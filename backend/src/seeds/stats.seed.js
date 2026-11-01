const Stat = require('../models/Stat.model');
const logger = require('../utils/logger');

const STATS = [
  { label: 'سنوات من الخبرة', value: 0, suffix: '+', icon: 'award', order: 0 },
  { label: 'عميل يثق بنا', value: 0, suffix: '+', icon: 'users', order: 1 },
  { label: 'منتج في الكتالوج', value: 0, suffix: '+', icon: 'layers', order: 2 },
  { label: 'طلب تم توريده', value: 0, suffix: '+', icon: 'target', order: 3 }
];

const seedStats = async ({ force = false } = {}) => {
  const count = await Stat.countDocuments();
  if (count > 0 && !force) {
    logger.info('Stats already exist, skipping');
    return;
  }
  if (force) await Stat.deleteMany({});
  await Stat.insertMany(STATS.map((stat) => ({ ...stat, prefix: '', description: '', isActive: false })));
  logger.info('Stats seeded as inactive placeholders. Enter the real numbers and activate them.');
};

module.exports = seedStats;