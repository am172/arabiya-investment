const mongoose = require('mongoose');
const { optionSchema } = require('./schemas/option.schema');

const schema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        description: { type: String, trim: true, maxlength: 300, default: '' },
        options: { type: [optionSchema], default: [] },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
    },
    { timestamps: true }
);

schema.index({ name: 1 });

module.exports = mongoose.model('OptionTemplate', schema);