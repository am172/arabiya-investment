const mongoose = require('mongoose');
const defaults = require('../constants/defaultContent');
const HERO_VARIANTS = require('../constants/heroVariants');
const HOME_SECTIONS = require('../constants/homeSections');
const SECTION_VARIANTS = require('../constants/sectionVariants');
const SLIDER = require('../constants/heroSlider');
const ALL_VARIANTS = [...new Set(Object.values(SECTION_VARIANTS).flat())];
const icon = () => ({ type: String, trim: true, lowercase: true, maxlength: 30, default: 'sparkles' });

const asset = () => ({
  url: { type: String, default: '' },
  publicId: { type: String, default: '' }
});

const cta = () => ({
  label: { type: String, trim: true, maxlength: 40, default: '' },
  href: { type: String, trim: true, maxlength: 300, default: '' }
});

const featureSchema = new mongoose.Schema(
  {
    icon: icon(),
    title: { type: String, required: true, trim: true, maxlength: 80 },
    text: { type: String, required: true, trim: true, maxlength: 300 }
  },
  { _id: false }
);

const badgeSchema = new mongoose.Schema(
  {
    icon: icon(),
    text: { type: String, required: true, trim: true, maxlength: 40 }
  },
  { _id: false }
);

const slideSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, default: true },
    company: { type: String, trim: true, maxlength: 80, default: '' },
    logo: asset(),
    eyebrow: { type: String, trim: true, maxlength: 80, default: '' },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    image: asset(),
    primaryCta: cta(),
    secondaryCta: cta()
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    icon: icon(),
    name: { type: String, required: true, trim: true, maxlength: 60 }
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 200 },
    answer: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    key: { type: String, enum: HOME_SECTIONS, required: true },
    enabled: { type: Boolean, default: true },
    variant: { type: String, enum: ['', ...ALL_VARIANTS], default: '' }
  },
  { _id: false }
);

const landingContentSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },
    hero: {
      variant: { type: String, enum: HERO_VARIANTS, default: 'split' },
      eyebrow: { type: String, trim: true, maxlength: 80, default: '' },
      title: { type: String, trim: true, maxlength: 160, default: '' },
      description: { type: String, trim: true, maxlength: 500, default: '' },
      image: asset(),
      bannerImage: asset(),
      bannerOverlay: { type: Number, min: 0, max: 90, default: 55 },
      badges: { type: [badgeSchema], default: [] },
      primaryCta: cta(),
      secondaryCta: cta(),
      slides: { type: [slideSchema], default: [] },
      slider: {
        autoplay: { type: Boolean, default: true },
        interval: { type: Number, min: SLIDER.MIN_INTERVAL, max: SLIDER.MAX_INTERVAL, default: 6 },
        effect: { type: String, enum: SLIDER.EFFECTS, default: 'fade' },
        showArrows: { type: Boolean, default: true },
        showDots: { type: Boolean, default: true }
      }
    },
    sections: { type: [sectionSchema], default: [] },
    features: { type: [featureSchema], default: [] },
    steps: { type: [featureSchema], default: [] },
    subjects: { type: [subjectSchema], default: [] },
    faqs: { type: [faqSchema], default: [] },
    story: {
      eyebrow: { type: String, trim: true, maxlength: 60, default: '' },
      title: { type: String, trim: true, maxlength: 120, default: '' },
      highlight: { type: String, trim: true, maxlength: 80, default: '' },
      paragraphs: { type: [{ type: String, trim: true, maxlength: 1500 }], default: [] }
    }
  },
  { timestamps: true }
);

const cloneDefaults = () => JSON.parse(JSON.stringify(defaults));

landingContentSchema.statics.getContent = async function () {
  let doc = await this.findOne({ key: 'main' });

  if (!doc) {
    try {
      doc = await this.create({ key: 'main', ...cloneDefaults() });
    } catch (error) {
      if (error.code !== 11000) throw error;
      doc = await this.findOne({ key: 'main' });
    }
    return doc;
  }

  const raw = await this.findOne({ key: 'main' }).select('hero sections story').lean();
  const stored = raw && raw.hero;
  const fresh = cloneDefaults();
  const patch = {};

  if (!stored) {
    patch.hero = fresh.hero;
  } else {
    if (stored.variant === undefined) {
      patch['hero.variant'] = fresh.hero.variant;
      patch['hero.bannerOverlay'] = fresh.hero.bannerOverlay;
      patch['hero.badges'] = fresh.hero.badges;
    }
    if (stored.primaryCta === undefined) patch['hero.primaryCta'] = fresh.hero.primaryCta;
    if (stored.secondaryCta === undefined) patch['hero.secondaryCta'] = fresh.hero.secondaryCta;
    if (stored.slides === undefined) patch['hero.slides'] = [];
    if (stored.slider === undefined) patch['hero.slider'] = fresh.hero.slider;
  }

  if (raw && raw.sections === undefined) patch.sections = fresh.sections;

  if (raw && raw.story === undefined) {
    patch.story = fresh.story || { eyebrow: '', title: '', highlight: '', paragraphs: [] };
  }

  if (Object.keys(patch).length > 0) {
    await this.updateOne({ key: 'main' }, { $set: patch });
    doc = await this.findOne({ key: 'main' });
  }

  return doc;
};

landingContentSchema.statics.replaceContent = async function (update) {
  await this.getContent();
  return this.findOneAndUpdate({ key: 'main' }, { $set: update }, { new: true, runValidators: true });
};

landingContentSchema.statics.resetContent = async function () {
  const current = (await this.getContent()).toObject();
  const data = cloneDefaults();
  const kept = current.hero || {};

  ['image', 'bannerImage'].forEach((key) => {
    if (kept[key]) data.hero[key] = { url: kept[key].url || '', publicId: kept[key].publicId || '' };
  });

  data.hero.slides = kept.slides || [];
  data.hero.slider = { ...data.hero.slider, ...(kept.slider || {}) };
  if (data.hero.slides.length > 0 && kept.variant) data.hero.variant = kept.variant;

  return this.findOneAndUpdate({ key: 'main' }, { $set: data }, { new: true, runValidators: true });
};

module.exports = mongoose.model('LandingContent', landingContentSchema);