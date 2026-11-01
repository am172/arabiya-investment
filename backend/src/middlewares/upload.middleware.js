const os = require('os');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/x-icon',
  'image/vnd.microsoft.icon'
];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const PDF_TYPES = ['application/pdf'];

const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const VIDEO_MAX_SIZE = 100 * 1024 * 1024;
const PDF_MAX_SIZE = 4 * 1024 * 1024;

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) return cb(null, true);
  return cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
};

const safeExtension = (filename) => {
  const ext = path.extname(filename || '').toLowerCase();
  return /^\.[a-z0-9]{2,5}$/.test(ext) ? ext : '';
};

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) =>
    cb(null, `nebras-${crypto.randomUUID()}${safeExtension(file.originalname)}`)
});

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_MAX_SIZE, files: 1 },
  fileFilter: fileFilter(IMAGE_TYPES)
}).single('file');

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: VIDEO_MAX_SIZE, files: 1 },
  fileFilter: fileFilter(VIDEO_TYPES)
}).single('file');

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PDF_MAX_SIZE, files: 1 },
  fileFilter: fileFilter(PDF_TYPES)
}).single('file');

const DOC_MAX_SIZE = 10 * 1024 * 1024;

const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: DOC_MAX_SIZE, files: 1 },
  fileFilter: fileFilter(PDF_TYPES)
}).single('file');

module.exports = { uploadImage, uploadVideo, uploadPdf, uploadDocument };

