const mongoose = require('mongoose');

const statSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Stat label is required'],
      trim: true,
      maxlength: 100
    },
    value: {
      type: Number,
      required: [true, 'Stat value is required'],
      min: 0
    },
    prefix: {
      type: String,
      trim: true,
      maxlength: 10,
      default: ''
    },
    suffix: {
      type: String,
      trim: true,
      maxlength: 10,
      default: ''
    },
    icon: {
      type: String,
      trim: true,
      maxlength: 60,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
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

statSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Stat', statSchema);