const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: ''
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 150,
      default: ''
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 2000
    },
    childAge: {
      type: Number,
      min: 1,
      max: 18
    },
    packageInterest: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ''
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

contactMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);