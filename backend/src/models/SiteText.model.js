const mongoose = require('mongoose');

const siteTextSchema = new mongoose.Schema(
    {
        key: { type: String, default: 'main', unique: true, immutable: true },
        values: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    { timestamps: true, minimize: false }
);

siteTextSchema.statics.getTexts = async function () {
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

siteTextSchema.statics.replaceTexts = async function (values) {
    await this.getTexts();
    return this.findOneAndUpdate({ key: 'main' }, { $set: { values } }, { new: true });
};

module.exports = mongoose.model('SiteText', siteTextSchema);