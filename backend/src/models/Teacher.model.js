const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Teacher name is required'],
            trim: true,
            maxlength: 100
        },
        title: {
            type: String,
            required: [true, 'Teacher title is required'],
            trim: true,
            maxlength: 120
        },
        bio: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ''
        },
        image: {
            url: { type: String, required: [true, 'Teacher image is required'] },
            publicId: { type: String, default: '' }
        },
        subjects: {
            type: [String],
            default: []
        },
        experienceYears: {
            type: Number,
            min: 0,
            default: 0
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 5
        },
        studentsCount: {
            type: Number,
            min: 0,
            default: 0
        },
        socialLinks: {
            facebook: { type: String, trim: true, default: '' },
            instagram: { type: String, trim: true, default: '' },
            linkedin: { type: String, trim: true, default: '' }
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

teacherSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);