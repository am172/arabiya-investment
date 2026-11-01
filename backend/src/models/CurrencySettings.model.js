const mongoose = require('mongoose');

const secondarySchema = new mongoose.Schema(
    {
        code: { type: String, required: true, uppercase: true, trim: true, match: /^[A-Z]{3}$/ },
        rateMode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
        manualRate: { type: Number, min: 0, default: null },
        roundTo: { type: Number, enum: [0, 1, 5, 10, 50, 100], default: 0 }
    },
    { _id: false }
);

const currencySettingsSchema = new mongoose.Schema(
    {
        key: { type: String, default: 'main', unique: true, immutable: true },
        primary: { type: String, default: 'USD', uppercase: true, trim: true, match: /^[A-Z]{3}$/ },
        autoDetect: { type: Boolean, default: true },
        secondary: { type: [secondarySchema], default: [] },
        rates: {
            base: { type: String, default: 'USD' },
            values: { type: mongoose.Schema.Types.Mixed, default: {} },
            fetchedAt: { type: Date, default: null }
        }
    },
    { timestamps: true, minimize: false }
);

currencySettingsSchema.statics.getSettings = async function () {
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

module.exports = mongoose.model('CurrencySettings', currencySettingsSchema);