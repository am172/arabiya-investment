const SiteSettings = require('../models/SiteSettings.model');
const data = require('../data/arabiya.defaults');
const logger = require('../utils/logger');

const GENERIC = ['', 'Nebras Academy'];
const clone = (value) => JSON.parse(JSON.stringify(value));

const seedSettings = async ({ force = false } = {}) => {
    const current = await SiteSettings.findOne({ key: 'main' });
    const untouched = !current || GENERIC.includes(current.siteName);

    if (!force && !untouched) {
        logger.info('Site settings already customised, skipping');
        return;
    }

    const payload = {
        siteName: data.brand.siteName,
        tagline: data.brand.tagline,
        contact: clone(data.contact),
        socialLinks: clone(data.socialLinks),
        seo: clone(data.seo),
        theme: clone(data.theme)
    };
    if (data.brand.logo && data.brand.logo.url) payload.logo = clone(data.brand.logo);
    if (data.brand.favicon && data.brand.favicon.url) payload.favicon = clone(data.brand.favicon);

    await SiteSettings.updateSettings(payload);
    logger.info('Site settings seeded');
};

module.exports = seedSettings;