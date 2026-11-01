const SiteSettings = require('../models/SiteSettings.model');
const logger = require('../utils/logger');

const GENERIC = ['', 'Nebras Academy', 'أكاديمية التعلم'];

const seedBrand = async ({ force = false } = {}) => {
    const current = await SiteSettings.getSettings();

    if (!force && !GENERIC.includes(current.siteName)) {
        logger.info('Site settings already customised, skipping brand seed');
        return;
    }

    await SiteSettings.updateSettings({
        siteName: 'العربية للاستثمار',
        tagline: 'الجبس والمواد الصناعية بمعايير جودة موثوقة',
        seo: {
            title: 'العربية للاستثمار | منتجات الجبس والمواد الصناعية',
            description:
                'العربية للاستثمار: منتجات الجبس والمواد الصناعية للمصانع والمقاولين وشركات البناء. تصفح الكتالوج واطلب عرض سعر بالمواصفات والتعبئة التي تناسبك.',
            keywords: []
        }
    });

    logger.info('Brand settings seeded');
};

module.exports = seedBrand;