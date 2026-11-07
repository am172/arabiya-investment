const Partner = require('../models/Partner.model');
const data = require('../data/arabiya.defaults');
const logger = require('../utils/logger');

const seedPartners = async ({ force = false } = {}) => {
    const count = await Partner.countDocuments();
    if (count > 0 && !force) {
        logger.info('Partners already exist, skipping');
        return;
    }
    if (force) await Partner.deleteMany({});

    const items = data.partners.filter((partner) => partner.image && /^https?:\/\//i.test(partner.image.url || ''));
    if (items.length === 0) {
        logger.info('No partners in the defaults file, skipping');
        return;
    }

    await Partner.insertMany(
        items.map((partner, index) => ({
            name: partner.name || '',
            url: partner.url || '',
            image: { url: partner.image.url, publicId: partner.image.publicId || '' },
            order: index,
            isActive: true
        }))
    );
    logger.info('Partners seeded');
};

module.exports = seedPartners;