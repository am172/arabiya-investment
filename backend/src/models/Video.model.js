const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Video title is required'],
            trim: true,
            maxlength: 150
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ''
        },
        studentName: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ''
        },
        studentAge: {
            type: Number,
            min: 3,
            max: 18
        },
        source: {
            type: String,
            enum: ['upload', 'youtube', 'vimeo'],
            default: 'upload'
        },
        videoUrl: {
            type: String,
            required: [true, 'Video URL is required'],
            trim: true
        },
        videoPublicId: {
            type: String,
            default: ''
        },
        thumbnail: {
            url: { type: String, default: '' },
            publicId: { type: String, default: '' }
        },
        duration: {
            type: Number,
            min: 0,
            default: 0
        },
        isFeatured: {
            type: Boolean,
            default: false
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

videoSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Video', videoSchema);