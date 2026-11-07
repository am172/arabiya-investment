const LegalPage = require('../models/LegalPage.model');
const SLUGS = require('../constants/legalSlugs');
const logger = require('../utils/logger');

const seedLegal = async ({ force = false } = {}) => {
    for (const slug of SLUGS) {
        if (force) await LegalPage.resetPage(slug);
        else await LegalPage.getPage(slug);
    }
    logger.info(`Legal pages ready (${SLUGS.join(', ')})`);
};

module.exports = seedLegal;