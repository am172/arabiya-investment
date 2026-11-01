const mongoose = require('mongoose');
const defaults = require('../constants/defaultLegal');
const LEGAL_SLUGS = require('../constants/legalSlugs');

const sectionSchema = new mongoose.Schema(
    {
        heading: { type: String, required: true, trim: true, maxlength: 150 },
        body: { type: String, required: true, trim: true, maxlength: 5000 }
    },
    { _id: false }
);

const legalPageSchema = new mongoose.Schema(
    {
        slug: { type: String, enum: LEGAL_SLUGS, required: true, unique: true, immutable: true },
        title: { type: String, required: true, trim: true, maxlength: 120 },
        intro: { type: String, trim: true, maxlength: 1000, default: '' },
        sections: { type: [sectionSchema], default: [] }
    },
    { timestamps: true }
);

const cloneDefault = (slug) => JSON.parse(JSON.stringify(defaults[slug]));

legalPageSchema.statics.getPage = async function (slug) {
    let doc = await this.findOne({ slug });
    if (doc) return doc;

    try {
        doc = await this.create({ slug, ...cloneDefault(slug) });
    } catch (error) {
        if (error.code !== 11000) throw error;
        doc = await this.findOne({ slug });
    }
    return doc;
};

legalPageSchema.statics.replacePage = async function (slug, update) {
    await this.getPage(slug);
    return this.findOneAndUpdate({ slug }, { $set: update }, { new: true, runValidators: true });
};

legalPageSchema.statics.resetPage = async function (slug) {
    await this.getPage(slug);
    return this.findOneAndUpdate(
        { slug },
        { $set: cloneDefault(slug) },
        { new: true, runValidators: true }
    );
};

module.exports = mongoose.model('LegalPage', legalPageSchema);