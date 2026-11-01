const mongoose = require('mongoose');
const { KINDS, BADGE_TONES } = require('../constants/catalog');
const { optionSchema } = require('./schemas/option.schema');

const { ObjectId } = mongoose.Schema.Types;

const asset = () => ({
    url: { type: String, trim: true, default: '' },
    publicId: { type: String, trim: true, default: '' }
});

const galleryItemSchema = new mongoose.Schema(
    {
        url: { type: String, required: true, trim: true },
        publicId: { type: String, trim: true, default: '' },
        alt: { type: String, trim: true, maxlength: 200, default: '' },
        isCover: { type: Boolean, default: false }
    },
    { _id: false }
);

const badgeSchema = new mongoose.Schema(
    {
        text: { type: String, required: true, trim: true, maxlength: 40 },
        tone: { type: String, enum: BADGE_TONES, default: 'primary' }
    },
    { _id: false }
);

const featureSchema = new mongoose.Schema(
    {
        icon: { type: String, trim: true, maxlength: 40, default: 'sparkles' },
        title: { type: String, required: true, trim: true, maxlength: 120 },
        text: { type: String, trim: true, maxlength: 500, default: '' }
    },
    { _id: false }
);

const specSchema = new mongoose.Schema(
    {
        group: { type: String, trim: true, maxlength: 80, default: '' },
        label: { type: String, required: true, trim: true, maxlength: 120 },
        value: { type: String, trim: true, maxlength: 300, default: '' }
    },
    { _id: false }
);

const documentSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 150 },
        url: { type: String, required: true, trim: true },
        publicId: { type: String, trim: true, default: '' },
        resourceType: { type: String, enum: ['raw', 'image'], default: 'raw' },
        format: { type: String, trim: true, maxlength: 10, default: 'pdf' },
        bytes: { type: Number, min: 0, default: 0 }
    },
    { _id: false }
);

const nodeSchema = new mongoose.Schema(
    {
        kind: { type: String, enum: KINDS, required: true },
        name: { type: String, required: true, trim: true, maxlength: 200 },
        slug: { type: String, required: true, trim: true, maxlength: 120 },
        parent: { type: ObjectId, ref: 'CatalogNode', default: null },
        ancestors: { type: [ObjectId], default: [] },
        depth: { type: Number, default: 0, min: 0 },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        summary: { type: String, trim: true, maxlength: 500, default: '' },
        description: { type: String, trim: true, maxlength: 20000, default: '' },
        sku: { type: String, trim: true, maxlength: 60, default: '' },
        banner: asset(),
        cover: asset(),
        gallery: { type: [galleryItemSchema], default: [] },
        badges: { type: [badgeSchema], default: [] },
        features: { type: [featureSchema], default: [] },
        specs: { type: [specSchema], default: [] },
        documents: { type: [documentSchema], default: [] },
        options: { type: [optionSchema], default: [] },
        inheritOptions: { type: Boolean, default: false },
        allowOrderRequest: { type: Boolean, default: true },
        ctaLabel: { type: String, trim: true, maxlength: 60, default: '' },
        seo: {
            title: { type: String, trim: true, maxlength: 120, default: '' },
            description: { type: String, trim: true, maxlength: 320, default: '' },
            keywords: { type: [String], default: [] }
        },
        tags: { type: [String], default: [] },
        createdBy: { type: ObjectId, ref: 'Admin' }
    },
    { timestamps: true, minimize: false }
);

nodeSchema.index({ kind: 1, slug: 1 }, { unique: true });
nodeSchema.index({ parent: 1, order: 1 });
nodeSchema.index({ ancestors: 1 });
nodeSchema.index({ isActive: 1, isFeatured: 1, kind: 1 });

nodeSchema.pre('validate', function (next) {
    const gallery = this.gallery || [];
    if (gallery.length > 0) {
        const index = Math.max(0, gallery.findIndex((item) => item.isCover));
        gallery.forEach((item, position) => {
            item.isCover = position === index;
        });
        this.cover = { url: gallery[index].url, publicId: gallery[index].publicId };
    } else {
        this.cover = { url: '', publicId: '' };
    }
    next();
});

nodeSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('CatalogNode', nodeSchema);