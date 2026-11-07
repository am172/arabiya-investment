const SiteText = require('../models/SiteText.model');
const data = require('../data/arabiya.defaults');
const logger = require('../utils/logger');

const seedTexts = async ({ force = false } = {}) => {
    const doc = await SiteText.getTexts();
    const current = doc.values && typeof doc.values === 'object' ? doc.values : {};
    const values = force ? { ...data.texts } : { ...data.texts, ...current };

    await SiteText.replaceTexts(values);
    logger.info('Site texts seeded');
};

module.exports = seedTexts;