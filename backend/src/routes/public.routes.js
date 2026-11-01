const express = require('express');
const teacherController = require('../controllers/teacher.controller');
const videoController = require('../controllers/video.controller');
const packageController = require('../controllers/package.controller');
const statController = require('../controllers/stat.controller');
const testimonialController = require('../controllers/testimonial.controller');
const settingsController = require('../controllers/settings.controller');
const contactController = require('../controllers/contact.controller');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const validate = require('../middlewares/validate.middleware');
const { contactLimiter } = require('../middlewares/rateLimiter.middleware');
const { validateCreateContact } = require('../validators/contact.validator');
const contentController = require('../controllers/content.controller');
const legalController = require('../controllers/legal.controller');
const textController = require('../controllers/text.controller');
const currencyController = require('../controllers/currency.controller');
const certificateController = require('../controllers/certificate.controller');
const { verifyLimiter } = require('../middlewares/rateLimiter.middleware');
const publicCatalog = require('../controllers/publicCatalog.controller');
const productRequestController = require('../controllers/productRequest.controller');
const validateBody = require('../middlewares/validate.middleware');
const { contactLimiter: requestLimiter } = require('../middlewares/rateLimiter.middleware');
const { validateSubmitRequest } = require('../validators/productRequest.validator');
const router = express.Router();

router.param('id', validateObjectId);

// router.get('/teachers', teacherController.getPublicTeachers);
// router.get('/teachers/:id', teacherController.getPublicTeacherById);

router.get('/videos', videoController.getPublicVideos);

// router.get('/packages', packageController.getPublicPackages);

router.get('/stats', statController.getPublicStats);

router.get('/testimonials', testimonialController.getPublicTestimonials);
router.get('/content', contentController.getPublicContent);
router.get('/legal/:slug', legalController.getPublicLegal);
router.get('/settings', settingsController.getPublicSettings);
router.get('/theme', settingsController.getPublicTheme);
router.get('/texts', textController.getPublicTexts);

// router.get('/currencies', currencyController.getPublicCurrencies);
// router.get('/certificates/:code', verifyLimiter, certificateController.verifyCertificate);

router.post(
  '/contact',
  contactLimiter,
  validate(validateCreateContact),
  contactController.submitMessage
);

router.get('/catalog/tree', publicCatalog.tree);
router.get('/catalog/categories', publicCatalog.categories);
router.get('/catalog/categories/:slug', publicCatalog.category);
router.get('/catalog/categories/:slug/products', publicCatalog.categoryProducts);
router.get('/catalog/products/:slug', publicCatalog.product);
router.get('/catalog/featured', publicCatalog.featured);
router.get('/catalog/search', publicCatalog.search);
router.get('/catalog/sitemap', publicCatalog.sitemap);
router.post('/requests', requestLimiter, validateBody(validateSubmitRequest), productRequestController.submit);
module.exports = router;