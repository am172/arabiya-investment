const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ROLES = require('../constants/roles');

const adminSchema = new mongoose.Schema(
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
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.ADMIN
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    passwordChangedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Admin', adminSchema);