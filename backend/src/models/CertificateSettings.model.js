const mongoose = require('mongoose');
const TEMPLATES = require('../constants/certificateTemplates');

const color = () => ({ type: String, default: '', match: /^#[0-9a-fA-F]{6}$/ });

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },
    prefix: { type: String, uppercase: true, trim: true, match: /^[A-Z0-9]{2,8}$/, default: 'CERT' },
    title: { type: String, trim: true, maxlength: 80, default: 'شهادة إتمام' },
    intro: { type: String, trim: true, maxlength: 120, default: 'تشهد الأكاديمية بأن' },
    bodyLine: { type: String, trim: true, maxlength: 120, default: 'قد أتمّ بنجاح' },
    signerName: { type: String, trim: true, maxlength: 80, default: '' },
    signerTitle: { type: String, trim: true, maxlength: 80, default: '' },
    signature: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    footerNote: { type: String, trim: true, maxlength: 200, default: '' },
    defaultTemplate: { type: String, enum: TEMPLATES, default: 'classic' },
    useBrandColors: { type: Boolean, default: true },
    primaryColor: color(),
    secondaryColor: color(),
    sequence: { type: Number, default: 0 }
  },
  { timestamps: true }
);

settingsSchema.statics.getSettings = async function () {
  let doc = await this.findOne({ key: 'main' });
  if (doc) return doc;
  try {
    doc = await this.create({ key: 'main' });
  } catch (error) {
    if (error.code !== 11000) throw error;
    doc = await this.findOne({ key: 'main' });
  }
  return doc;
};

settingsSchema.statics.nextSequence = async function () {
  const doc = await this.findOneAndUpdate(
    { key: 'main' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return doc.sequence;
};

module.exports = mongoose.model('CertificateSettings', settingsSchema);