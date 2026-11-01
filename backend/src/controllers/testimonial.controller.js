const Testimonial = require('../models/Testimonial.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');
const destroyAsset = require('../utils/destroyAsset');
const { getPagination, getMeta } = require('../utils/pagination');

const ALLOWED_FIELDS = ['name', 'role', 'content', 'avatar', 'rating', 'order', 'isActive'];

const getPublicTestimonials = asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 60);
    const testimonials = await Testimonial.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .limit(limit)
        .select('-__v')
        .lean();
    res.status(200).json(new ApiResponse(200, testimonials, 'Testimonials fetched successfully'));
});

const getTestimonials = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'i');
        filter.$or = [{ name: regex }, { role: regex }, { content: regex }];
    }
    if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
    }

    const [items, total] = await Promise.all([
        Testimonial.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
        Testimonial.countDocuments(filter)
    ]);

    res
        .status(200)
        .json(
            new ApiResponse(200, items, 'Testimonials fetched successfully', getMeta(total, page, limit))
        );
});

const getTestimonialById = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findById(req.params.id).lean();
    if (!testimonial) throw new ApiError(404, 'Testimonial not found');
    res.status(200).json(new ApiResponse(200, testimonial, 'Testimonial fetched successfully'));
});

const createTestimonial = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.create(pick(req.body, ALLOWED_FIELDS));
    res.status(201).json(new ApiResponse(201, testimonial, 'Testimonial created successfully'));
});

const updateTestimonial = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) throw new ApiError(404, 'Testimonial not found');

    const payload = pick(req.body, ALLOWED_FIELDS);
    const previousPublicId = testimonial.avatar ? testimonial.avatar.publicId : '';

    testimonial.set(payload);
    await testimonial.save();

    if (payload.avatar && previousPublicId && previousPublicId !== testimonial.avatar.publicId) {
        await destroyAsset(previousPublicId);
    }

    res.status(200).json(new ApiResponse(200, testimonial, 'Testimonial updated successfully'));
});

const toggleTestimonialStatus = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) throw new ApiError(404, 'Testimonial not found');
    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();
    res.status(200).json(new ApiResponse(200, testimonial, 'Testimonial status updated successfully'));
});

const reorderTestimonials = asyncHandler(async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, 'Items array is required');
    }

    const operations = items.map(({ id, order }) => ({
        updateOne: {
            filter: { _id: id },
            update: { $set: { order: Number(order) || 0 } }
        }
    }));

    await Testimonial.bulkWrite(operations);
    res.status(200).json(new ApiResponse(200, null, 'Testimonials reordered successfully'));
});

const deleteTestimonial = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) throw new ApiError(404, 'Testimonial not found');

    await testimonial.deleteOne();
    if (testimonial.avatar && testimonial.avatar.publicId) {
        await destroyAsset(testimonial.avatar.publicId);
    }

    res.status(200).json(new ApiResponse(200, null, 'Testimonial deleted successfully'));
});

module.exports = {
    getPublicTestimonials,
    getTestimonials,
    getTestimonialById,
    createTestimonial,
    updateTestimonial,
    toggleTestimonialStatus,
    reorderTestimonials,
    deleteTestimonial
};