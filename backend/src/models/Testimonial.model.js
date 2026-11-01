const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100
    },
    role: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ''
    },
    content: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: 10,
      maxlength: 600
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
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

testimonialSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);