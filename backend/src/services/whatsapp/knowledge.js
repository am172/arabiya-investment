const SiteSettings = require('../../models/SiteSettings.model');
const Package = require('../../models/Package.model');
const Teacher = require('../../models/Teacher.model');
const Stat = require('../../models/Stat.model');
const LandingContent = require('../../models/LandingContent.model');

const TTL = 60 * 1000;
const MAX_LENGTH = 7000;
const PERIODS = {
  weekly: 'أسبوعيًا',
  monthly: 'شهريًا',
  quarterly: 'كل ربع سنة',
  yearly: 'سنويًا',
  'one-time': 'دفعة واحدة'
};

let cache = { at: 0, text: '' };

const cut = (value, max) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);

const build = async () => {
  const [settings, packages, teachers, stats, content] = await Promise.all([
    SiteSettings.getSettings(),
    Package.find({ isActive: true }).sort({ order: 1 }).lean(),
    Teacher.find({ isActive: true }).sort({ order: 1 }).limit(20).lean(),
    Stat.find({ isActive: true }).sort({ order: 1 }).lean(),
    LandingContent.getContent()
  ]);

  const landing = content.toObject();
  const contact = settings.contact || {};
  const lines = [`اسم الأكاديمية: ${settings.siteName}`];

  if (settings.tagline) lines.push(`نبذة: ${cut(settings.tagline, 200)}`);
  if (contact.email) lines.push(`البريد الإلكتروني: ${contact.email}`);
  if (contact.phone) lines.push(`الهاتف: ${contact.phone}`);
  if (contact.address) lines.push(`العنوان: ${cut(contact.address, 200)}`);

  if (packages.length) {
    lines.push('', 'الباقات والأسعار:');
    packages.forEach((pkg) => {
      const price = pkg.discountPrice != null ? `${pkg.discountPrice} (بدلًا من ${pkg.price})` : pkg.price;
      const parts = [
        `${pkg.name}: ${price} ${pkg.currency} ${PERIODS[pkg.billingPeriod] || ''}`.trim(),
        pkg.sessionsPerMonth ? `${pkg.sessionsPerMonth} حصة شهريًا` : '',
        pkg.sessionDuration ? `مدة الحصة ${pkg.sessionDuration} دقيقة` : '',
        pkg.features && pkg.features.length ? `المميزات: ${pkg.features.slice(0, 6).join('، ')}` : ''
      ].filter(Boolean);
      lines.push(`- ${parts.join(' | ')}`);
    });
  }

  if (teachers.length) {
    lines.push('', 'المعلمون:');
    teachers.forEach((teacher) => {
      const subjects = (teacher.subjects || []).join('، ');
      lines.push(`- ${teacher.name} (${teacher.title})${subjects ? `: ${subjects}` : ''}`);
    });
  }

  if (landing.subjects && landing.subjects.length) {
    lines.push('', `المواد المتاحة: ${landing.subjects.map((subject) => subject.name).join('، ')}`);
  }

  if (stats.length) {
    lines.push('', `أرقامنا: ${stats.map((stat) => `${stat.label} ${stat.prefix || ''}${stat.value}${stat.suffix || ''}`).join('، ')}`);
  }

  if (landing.faqs && landing.faqs.length) {
    lines.push('', 'الأسئلة الشائعة:');
    landing.faqs.slice(0, 10).forEach((faq) => {
      lines.push(`س: ${cut(faq.question, 150)}`, `ج: ${cut(faq.answer, 350)}`);
    });
  }

  return lines.join('\n').slice(0, MAX_LENGTH);
};

const getKnowledge = async () => {
  if (Date.now() - cache.at < TTL && cache.text) return cache.text;
  cache = { at: Date.now(), text: await build() };
  return cache.text;
};

module.exports = getKnowledge;