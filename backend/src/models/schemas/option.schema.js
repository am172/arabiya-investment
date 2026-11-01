const mongoose = require('mongoose');
const { OPTION_TYPES } = require('../../constants/catalog');

const optionValueSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, trim: true, maxlength: 40 },
        label: { type: String, required: true, trim: true, maxlength: 120 },
        description: { type: String, trim: true, maxlength: 200, default: '' },
        isDefault: { type: Boolean, default: false }
    },
    { _id: false }
);

const optionSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, trim: true, maxlength: 40 },
        title: { type: String, required: true, trim: true, maxlength: 120 },
        type: { type: String, enum: OPTION_TYPES, required: true },
        isRequired: { type: Boolean, default: false },
        helpText: { type: String, trim: true, maxlength: 300, default: '' },
        placeholder: { type: String, trim: true, maxlength: 120, default: '' },
        values: { type: [optionValueSchema], default: [] },
        min: { type: Number, default: null },
        max: { type: Number, default: null },
        step: { type: Number, default: null },
        unit: { type: String, trim: true, maxlength: 30, default: '' },
        defaultNumber: { type: Number, default: null },
        maxLength: { type: Number, default: null }
    },
    { _id: false }
);

module.exports = { optionSchema, optionValueSchema };