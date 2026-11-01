const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ['pageview', 'event'], required: true },
        visitorHash: { type: String, required: true },
        sessionHash: { type: String, required: true },
        viewId: { type: String, default: '', maxlength: 64 },
        path: { type: String, required: true, maxlength: 300 },
        title: { type: String, default: '', maxlength: 150 },
        referrer: { type: String, default: '', maxlength: 300 },
        referrerHost: { type: String, default: '', maxlength: 120 },
        source: { type: String, default: 'Direct', maxlength: 120 },
        utm: {
            source: { type: String, default: '', maxlength: 60 },
            medium: { type: String, default: '', maxlength: 60 },
            campaign: { type: String, default: '', maxlength: 100 }
        },
        eventName: { type: String, default: '', maxlength: 50 },
        eventLabel: { type: String, default: '', maxlength: 100 },
        duration: { type: Number, default: 0, min: 0 },
        device: {
            category: { type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' },
            os: { type: String, default: 'Other', maxlength: 40 },
            browser: { type: String, default: 'Other', maxlength: 40 }
        },
        geo: {
            country: { type: String, default: '', maxlength: 2 },
            countryName: { type: String, default: 'Unknown', maxlength: 80 },
            city: { type: String, default: '', maxlength: 100 }
        },
        createdAt: { type: Date, default: Date.now }
    },
    { timestamps: false, versionKey: false }
);

analyticsSchema.index({ type: 1, createdAt: -1 });
analyticsSchema.index(
    { viewId: 1, sessionHash: 1 },
    { unique: true, partialFilterExpression: { type: 'pageview' } }
);

module.exports = mongoose.model('Analytics', analyticsSchema);