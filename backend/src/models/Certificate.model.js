const mongoose = require('mongoose');
const TEMPLATES = require('../constants/certificateTemplates');

const certificateSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    serial: { type: String, required: true, unique: true },
    studentName: { type: String, required: true, trim: true, maxlength: 120 },
    courseName: { type: String, required: true, trim: true, maxlength: 150 },
    hours: { type: Number, min: 0, max: 5000, default: null },
    grade: { type: String, trim: true, maxlength: 40, default: '' },
    issueDate: { type: Date, required: true },
    completionDate: { type: Date, default: null },
    notes: { type: String, trim: true, maxlength: 300, default: '' },
    template: { type: String, enum: ['', ...TEMPLATES], default: '' },
    status: { type: String, enum: ['valid', 'revoked'], default: 'valid', index: true },
    revokedAt: { type: Date, default: null },
    revokedReason: { type: String, trim: true, maxlength: 200, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
  },
  { timestamps: true }
);

certificateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Certificate', certificateSchema);