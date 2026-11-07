const LandingContent = require('../models/LandingContent.model');
const defaults = require('../constants/defaultContent');
const logger = require('../utils/logger');

const seedContent = async ({ force = false } = {}) => {
    await LandingContent.getContent();

    if (force) {
        await LandingContent.replaceContent(JSON.parse(JSON.stringify(defaults)));
        logger.info('Landing content reset to defaults');
        return;
    }
    logger.info('Landing content ready');
};

module.exports = seedContent;