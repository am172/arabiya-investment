const mongoose = require('mongoose');

const hexColor = {
  type: String,
  trim: true,
  match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/, 'Invalid hex color']
};

const colorField = (defaultValue) => ({ ...hexColor, default: defaultValue });

const DARK_KEYS = [
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'accent',
  'background',
  'surface',
  'text',
  'textMuted',
  'border',
  'success',
  'warning',
  'error'
];

const darkColors = DARK_KEYS.reduce((acc, key) => ({ ...acc, [key]: { ...hexColor } }), {});

const siteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'main',
      unique: true,
      immutable: true
    },
    siteName: {
      type: String,
      trim: true,
      default: 'أكاديمية التعلم'
    },
    tagline: {
      type: String,
      trim: true,
      default: ''
    },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    favicon: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    theme: {
      colors: {
        primary: colorField('#4F46E5'),
        primaryForeground: colorField('#FFFFFF'),
        secondary: colorField('#F59E0B'),
        secondaryForeground: colorField('#1F2937'),
        accent: colorField('#EC4899'),
        background: colorField('#FFFFFF'),
        surface: colorField('#F9FAFB'),
        text: colorField('#111827'),
        textMuted: colorField('#6B7280'),
        border: colorField('#E5E7EB'),
        success: colorField('#10B981'),
        warning: colorField('#F59E0B'),
        error: colorField('#EF4444')
      },
      darkColors,
      fonts: {
        heading: { type: String, trim: true, default: 'Poppins' },
        body: { type: String, trim: true, default: 'Inter' }
      },
      borderRadius: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
        default: 'lg'
      },
      mode: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      }
    },
    contact: {
      email: { type: String, trim: true, lowercase: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      whatsapp: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' }
    },
    socialLinks: {
      facebook: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      youtube: { type: String, trim: true, default: '' },
      tiktok: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' }
    },
    seo: {
      title: { type: String, trim: true, default: '' },
      description: { type: String, trim: true, default: '' },
      keywords: { type: [String], default: [] },
      googleVerification: { type: String, trim: true, default: '' }
    }
  },
  { timestamps: true }
);

siteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: 'main' });
  if (!settings) {
    settings = await this.create({ key: 'main' });
  }
  return settings;
};

siteSettingsSchema.statics.updateSettings = async function (payload) {
  return this.findOneAndUpdate(
    { key: 'main' },
    { $set: payload },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);