const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema(
  {
    currency: { type: String, required: true, uppercase: true, trim: true, match: /^[A-Z]{3}$/ },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: null }
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Package price is required'],
      min: 0
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: null
    },
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: 'USD'
    },
    prices: { type: [priceSchema], default: [] },
    billingPeriod: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly', 'one-time'],
      default: 'monthly'
    },
    sessionsPerMonth: {
      type: Number,
      min: 0,
      default: 0
    },
    sessionDuration: {
      type: Number,
      min: 0,
      default: 45
    },
    features: {
      type: [String],
      default: []
    },
    badge: {
      type: String,
      trim: true,
      maxlength: 40,
      default: ''
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    ctaLabel: {
      type: String,
      trim: true,
      maxlength: 60,
      default: 'Subscribe Now'
    },
    ctaLink: {
      type: String,
      trim: true,
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

packageSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Package', packageSchema);