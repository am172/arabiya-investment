const mongoose = require('mongoose');
const { REQUEST_STATUSES } = require('../constants/catalog');

const { ObjectId } = mongoose.Schema.Types;

const answerValueSchema = new mongoose.Schema(
    { key: { type: String, required: true }, label: { type: String, required: true } },
    { _id: false }
);

const answerSchema = new mongoose.Schema(
    {
        optionKey: { type: String, required: true },
        title: { type: String, required: true },
        type: { type: String, required: true },
        values: { type: [answerValueSchema], default: [] },
        number: { type: Number, default: null },
        unit: { type: String, default: '' },
        text: { type: String, default: '' },
        display: { type: String, default: '' }
    },
    { _id: false }
);

const itemSchema = new mongoose.Schema(
    {
        product: { type: ObjectId, ref: 'CatalogNode', default: null },
        productName: { type: String, required: true },
        productSlug: { type: String, default: '' },
        kind: { type: String, default: 'product' },
        sku: { type: String, default: '' },
        path: { type: [String], default: [] },
        image: { type: String, default: '' },
        options: { type: [answerSchema], default: [] },
        note: { type: String, trim: true, maxlength: 500, default: '' }
    },
    { _id: false }
);

const historySchema = new mongoose.Schema(
    {
        status: { type: String, enum: REQUEST_STATUSES, required: true },
        note: { type: String, trim: true, maxlength: 500, default: '' },
        by: { type: ObjectId, ref: 'Admin', default: null },
        byName: { type: String, default: '' },
        at: { type: Date, default: Date.now }
    },
    { _id: false }
);

const requestSchema = new mongoose.Schema(
    {
        reference: { type: String, required: true, unique: true },
        name: { type: String, required: true, trim: true, maxlength: 120 },
        company: { type: String, trim: true, maxlength: 150, default: '' },
        email: { type: String, trim: true, lowercase: true, maxlength: 150, default: '' },
        phone: { type: String, required: true, trim: true, maxlength: 40 },
        city: { type: String, trim: true, maxlength: 100, default: '' },
        message: { type: String, trim: true, maxlength: 3000, default: '' },
        items: { type: [itemSchema], default: [] },
        status: { type: String, enum: REQUEST_STATUSES, default: 'new' },
        statusHistory: { type: [historySchema], default: [] },
        adminNote: { type: String, trim: true, maxlength: 2000, default: '' },
        readAt: { type: Date, default: null },
        ipAddress: { type: String, default: '' },
        userAgent: { type: String, maxlength: 300, default: '' },
        pageUrl: { type: String, maxlength: 300, default: '' }
    },
    { timestamps: true }
);

requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ProductRequest', requestSchema);