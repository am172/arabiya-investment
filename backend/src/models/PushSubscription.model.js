const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
        endpoint: { type: String, required: true, unique: true, maxlength: 1000 },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true }
        },
        userAgent: { type: String, default: '', maxlength: 300 }
    },
    { timestamps: true }
);

module.exports = mongoose.model('PushSubscription', schema);