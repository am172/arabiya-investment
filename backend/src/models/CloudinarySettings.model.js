const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        key: { type: String, default: 'main', unique: true, immutable: true },
        cloudName: { type: String, trim: true, default: '' },
        apiKey: { type: String, trim: true, default: '' },
        apiSecret: { type: String, select: false, default: '' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('CloudinarySettings', schema);