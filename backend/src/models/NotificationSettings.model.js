const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        key: { type: String, default: 'main', unique: true, immutable: true },
        pushEnabled: { type: Boolean, default: true },
        emailEnabled: { type: Boolean, default: true },
        notifyAllAdmins: { type: Boolean, default: true },
        extraRecipients: { type: [String], default: [] }
    },
    { timestamps: true }
);

schema.statics.getSettings = async function () {
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

module.exports = mongoose.model('NotificationSettings', schema);