const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        lat: { type: Number, min: -90, max: 90, default: null },
        lng: { type: Number, min: -180, max: 180, default: null }
    },
    { _id: false }
);

const schema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 100 },
        lat: { type: Number, required: true, min: -90, max: 90 },
        lng: { type: Number, required: true, min: -180, max: 180 },
        offices: { type: [officeSchema], default: [] },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

schema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('BranchGroup', schema);