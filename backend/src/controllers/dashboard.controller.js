const Teacher = require('../models/Teacher.model');
const Video = require('../models/Video.model');
const Package = require('../models/Package.model');
const Stat = require('../models/Stat.model');
const ContactMessage = require('../models/ContactMessage.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getOverview = asyncHandler(async (req, res) => {
  const [
    teachersTotal,
    teachersActive,
    videosTotal,
    videosActive,
    videosFeatured,
    packagesTotal,
    packagesActive,
    statsTotal,
    messagesTotal,
    messagesUnread,
    messagesLast7Days,
    recentMessages
  ] = await Promise.all([
    Teacher.countDocuments(),
    Teacher.countDocuments({ isActive: true }),
    Video.countDocuments(),
    Video.countDocuments({ isActive: true }),
    Video.countDocuments({ isFeatured: true }),
    Package.countDocuments(),
    Package.countDocuments({ isActive: true }),
    Stat.countDocuments(),
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ status: 'new' }),
    ContactMessage.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),
    ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt')
      .lean()
  ]);

  const data = {
    teachers: { total: teachersTotal, active: teachersActive },
    videos: { total: videosTotal, active: videosActive, featured: videosFeatured },
    packages: { total: packagesTotal, active: packagesActive },
    stats: { total: statsTotal },
    messages: { total: messagesTotal, unread: messagesUnread, last7Days: messagesLast7Days },
    recentMessages
  };

  res.status(200).json(new ApiResponse(200, data, 'Overview fetched successfully'));
});

module.exports = { getOverview };