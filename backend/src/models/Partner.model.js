const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true, maxlength: 100, default: '' },
        image: {
            url: { type: String, required: true, trim: true },
            publicId: { type: String, trim: true, default: '' }
        },
        url: { type: String, trim: true, maxlength: 300, default: '' },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

partnerSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('Partner', partnerSchema);