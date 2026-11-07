const mongoose = require('mongoose');

const subsidiarySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            maxlength: 150
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ''
        },
        image: {
            url: { type: String, required: [true, 'Cover image is required'], trim: true },
            publicId: { type: String, trim: true, default: '' }
        },
        link: {
            type: String,
            trim: true,
            maxlength: 300,
            default: ''
        },
        order: {
            type: Number,
            default: 0,
            index: true
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    { timestamps: true }
);

subsidiarySchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Subsidiary', subsidiarySchema);