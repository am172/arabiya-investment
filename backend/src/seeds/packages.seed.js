const Package = require('../models/Package.model');
const logger = require('../utils/logger');

const packages = [
  {
    name: 'الباقة الأساسية',
    description: 'بداية لطيفة للمتعلمين الجدد.',
    price: 49,
    currency: 'USD',
    billingPeriod: 'monthly',
    sessionsPerMonth: 4,
    sessionDuration: 45,
    features: ['4 حصص مباشرة شهريًا', 'مجموعات صغيرة', 'تقرير تقدم شهري'],
    badge: '',
    isPopular: false,
    ctaLabel: 'ابدأ الآن',
    ctaLink: '/#contact',
    order: 1
  },
  {
    name: 'الباقة المتقدمة',
    description: 'أفضل توازن بين الممارسة والتقدم.',
    price: 89,
    currency: 'USD',
    billingPeriod: 'monthly',
    sessionsPerMonth: 8,
    sessionDuration: 45,
    features: ['8 حصص مباشرة شهريًا', 'مجموعات صغيرة', 'تقرير تقدم أسبوعي', 'دعم في الواجبات'],
    badge: 'الأكثر طلبًا',
    isPopular: true,
    ctaLabel: 'اختر هذه الباقة',
    ctaLink: '/#contact',
    order: 2
  },
  {
    name: 'الباقة المميزة',
    description: 'اهتمام فردي لنتائج أسرع.',
    price: 149,
    currency: 'USD',
    billingPeriod: 'monthly',
    sessionsPerMonth: 12,
    sessionDuration: 60,
    features: [
      '12 حصة فردية شهريًا',
      'خطة تعلم مخصصة',
      'تقرير تقدم أسبوعي',
      'دعم في الواجبات',
      'أولوية في الجدولة'
    ],
    badge: '',
    isPopular: false,
    ctaLabel: 'اختر هذه الباقة',
    ctaLink: '/#contact',
    order: 3
  }
];

const seedPackages = async ({ force = false } = {}) => {
  const count = await Package.countDocuments();

  if (count > 0 && !force) {
    logger.info('Packages already exist');
    return;
  }

  if (force) await Package.deleteMany({});
  await Package.insertMany(packages);
  logger.info(`Seeded ${packages.length} packages`);
};

module.exports = seedPackages;