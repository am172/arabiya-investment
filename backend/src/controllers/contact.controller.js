const mongoose = require('mongoose');
const ContactMessage = require('../models/ContactMessage.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');
const { getPagination, getMeta } = require('../utils/pagination');
const notifications = require('../services/notification.service');

const CREATE_FIELDS = ['name', 'email', 'phone', 'subject', 'message', 'childAge', 'packageInterest'];
const STATUSES = ['new', 'read', 'replied', 'archived'];

const submitMessage = asyncHandler(async (req, res) => {
  if (req.body.website) {
    return res.status(201).json(new ApiResponse(201, null, 'Message sent successfully'));
  }

  const payload = pick(req.body, CREATE_FIELDS);
  if (payload.childAge === '' || payload.childAge === null) delete payload.childAge;

  const created = await ContactMessage.create({
    ...payload,
    ipAddress: req.ip || '',
    userAgent: String(req.get('user-agent') || '').slice(0, 300)
  });

  notifications.notifyNewMessage(created);

  res.status(201).json(new ApiResponse(201, null, 'Message sent successfully'));
});

const getMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.status && STATUSES.includes(req.query.status)) {
    filter.status = req.query.status;
  }
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: regex }, { email: regex }, { subject: regex }];
  }

  const [items, total, unread] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ContactMessage.countDocuments(filter),
    ContactMessage.countDocuments({ status: 'new' })
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, items, 'Messages fetched successfully', {
        ...getMeta(total, page, limit),
        unread
      })
    );
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await ContactMessage.countDocuments({ status: 'new' });
  res.status(200).json(new ApiResponse(200, { count }, 'Unread count fetched successfully'));
});

const getMessageById = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found');

  if (message.status === 'new') {
    message.status = 'read';
    message.readAt = new Date();
    await message.save();
  }

  res.status(200).json(new ApiResponse(200, message, 'Message fetched successfully'));
});

const updateMessageStatus = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found');

  message.status = req.body.status;
  if (req.body.status !== 'new' && !message.readAt) message.readAt = new Date();
  if (req.body.status === 'new') message.readAt = null;
  await message.save();

  res.status(200).json(new ApiResponse(200, message, 'Message status updated successfully'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await ContactMessage.updateMany(
    { status: 'new' },
    { $set: { status: 'read', readAt: new Date() } }
  );
  res
    .status(200)
    .json(new ApiResponse(200, { modified: result.modifiedCount }, 'Messages marked as read'));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found');
  await message.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Message deleted successfully'));
});

const bulkDeleteMessages = asyncHandler(async (req, res) => {
  const ids = req.body.ids.filter((id) => mongoose.isValidObjectId(id));
  if (ids.length === 0) throw new ApiError(400, 'No valid ids provided');

  const result = await ContactMessage.deleteMany({ _id: { $in: ids } });
  res
    .status(200)
    .json(new ApiResponse(200, { deleted: result.deletedCount }, 'Messages deleted successfully'));
});

module.exports = {
  submitMessage,
  getMessages,
  getUnreadCount,
  getMessageById,
  updateMessageStatus,
  markAllAsRead,
  deleteMessage,
  bulkDeleteMessages
};