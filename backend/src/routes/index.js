const express = require('express');
const mongoose = require('mongoose');
const publicRoutes = require('./public.routes');
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const analyticsRoutes = require('./analytics.routes');
const adminRoutes = require('./admin.routes');
const teacherRoutes = require('./teacher.routes');
const videoRoutes = require('./video.routes');
const packageRoutes = require('./package.routes');
const statRoutes = require('./stat.routes');
const contactRoutes = require('./contact.routes');
const settingsRoutes = require('./settings.routes');
const uploadRoutes = require('./upload.routes');
const testimonialRoutes = require('./testimonial.routes');
const contentRoutes = require('./content.routes');
const legalRoutes = require('./legal.routes');
const textRoutes = require('./text.routes');
const router = express.Router();
const partnerRoutes = require('./partner.routes');
const whatsappRoutes = require('./whatsapp.routes');
const subsidiaryRoutes = require('./subsidiary.routes');
const currencyRoutes = require('./currency.routes');
const certificateRoutes = require('./certificate.routes');
const cloudinaryRoutes = require('./cloudinary.routes');
const notificationRoutes = require('./notification.routes');
const catalogRoutes = require('./catalog.routes');
const optionTemplateRoutes = require('./optionTemplate.routes');
const productRequestRoutes = require('./productRequest.routes');
const branchRoutes = require('./branch.routes');
router.get('/health', async (req, res) => {
  let database = 'disconnected';

  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      database = 'connected';
    } catch (error) {
      database = 'unreachable';
    }
  }

  const healthy = database === 'connected';

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? 'ok' : 'unavailable',
    database,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

router.use('/public', publicRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admins', adminRoutes);
// router.use('/teachers', teacherRoutes);
router.use('/videos', videoRoutes);
// router.use('/packages', packageRoutes);
router.use('/stats', statRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/messages', contactRoutes);
router.use('/settings', settingsRoutes);
router.use('/uploads', uploadRoutes);
router.use('/content', contentRoutes);
router.use('/legal', legalRoutes);
router.use('/subsidiaries', subsidiaryRoutes);
router.use('/texts', textRoutes);
router.use('/whatsapp', whatsappRoutes);
// router.use('/currencies', currencyRoutes);
// router.use('/certificates', certificateRoutes);
router.use('/cloudinary', cloudinaryRoutes);
router.use('/branches', branchRoutes);
router.use('/notifications', notificationRoutes);
router.use('/catalog', catalogRoutes);
router.use('/partners', partnerRoutes);
router.use('/option-templates', optionTemplateRoutes);
router.use('/requests', productRequestRoutes);
module.exports = router;