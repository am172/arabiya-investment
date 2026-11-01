const SiteSettings = require('../models/SiteSettings.model');
const defaultTheme = require('../constants/defaultTheme');
const logger = require('../utils/logger');

const seedTheme = async ({ force = false } = {}) => {
  const existing = await SiteSettings.findOne({ key: 'main' });

  if (existing && !force) {
    logger.info('Site settings already exist');
    return;
  }

  await SiteSettings.updateSettings({
    siteName: 'أكاديمية التعلم',
    tagline: 'تعليم مباشر ممتع ومميز',
    theme: JSON.parse(JSON.stringify(defaultTheme))
  });

  logger.info('Site settings and default theme seeded');
};

module.exports = seedTheme;