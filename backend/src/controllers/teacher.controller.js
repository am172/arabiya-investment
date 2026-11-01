const Teacher = require('../models/Teacher.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');
const destroyAsset = require('../utils/destroyAsset');
const { getPagination, getMeta } = require('../utils/pagination');

const ALLOWED_FIELDS = [
  'name',
  'title',
  'bio',
  'image',
  'subjects',
  'experienceYears',
  'rating',
  'studentsCount',
  'socialLinks',
  'order',
  'isActive'
];

const getPublicTeachers = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 0, 50);
  const query = Teacher.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  if (limit) query.limit(limit);
  const teachers = await query.lean();
  res.status(200).json(new ApiResponse(200, teachers, 'Teachers fetched successfully'));
});

const getPublicTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ _id: req.params.id, isActive: true }).lean();
  if (!teacher) throw new ApiError(404, 'Teacher not found');
  res.status(200).json(new ApiResponse(200, teacher, 'Teacher fetched successfully'));
});

const getTeachers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: regex }, { title: regex }];
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const [items, total] = await Promise.all([
    Teacher.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Teacher.countDocuments(filter)
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, items, 'Teachers fetched successfully', getMeta(total, page, limit)));
});

const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).lean();
  if (!teacher) throw new ApiError(404, 'Teacher not found');
  res.status(200).json(new ApiResponse(200, teacher, 'Teacher fetched successfully'));
});

const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.create(pick(req.body, ALLOWED_FIELDS));
  res.status(201).json(new ApiResponse(201, teacher, 'Teacher created successfully'));
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw new ApiError(404, 'Teacher not found');

  const payload = pick(req.body, ALLOWED_FIELDS);
  const previousPublicId = teacher.image ? teacher.image.publicId : '';

  teacher.set(payload);
  await teacher.save();

  if (payload.image && previousPublicId && previousPublicId !== teacher.image.publicId) {
    await destroyAsset(previousPublicId);
  }

  res.status(200).json(new ApiResponse(200, teacher, 'Teacher updated successfully'));
});

const toggleTeacherStatus = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw new ApiError(404, 'Teacher not found');
  teacher.isActive = !teacher.isActive;
  await teacher.save();
  res.status(200).json(new ApiResponse(200, teacher, 'Teacher status updated successfully'));
});

const reorderTeachers = asyncHandler(async (req, res) => {
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

  await Teacher.bulkWrite(operations);
  res.status(200).json(new ApiResponse(200, null, 'Teachers reordered successfully'));
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw new ApiError(404, 'Teacher not found');

  await teacher.deleteOne();
  if (teacher.image && teacher.image.publicId) await destroyAsset(teacher.image.publicId);

  res.status(200).json(new ApiResponse(200, null, 'Teacher deleted successfully'));
});

module.exports = {
  getPublicTeachers,
  getPublicTeacherById,
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  toggleTeacherStatus,
  reorderTeachers,
  deleteTeacher
};