const crypto = require('crypto');
const Certificate = require('../models/Certificate.model');
const CertificateSettings = require('../models/CertificateSettings.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');
const destroyAsset = require('../utils/destroyAsset');
const { getPagination, getMeta } = require('../utils/pagination');
const whatsapp = require('../services/whatsapp/whatsapp.service');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CREATE_FIELDS = [
  'studentName',
  'courseName',
  'hours',
  'grade',
  'issueDate',
  'completionDate',
  'notes',
  'template'
];
const SETTINGS_FIELDS = [
  'prefix',
  'title',
  'intro',
  'bodyLine',
  'signerName',
  'signerTitle',
  'signature',
  'footerNote',
  'defaultTemplate',
  'useBrandColors',
  'primaryColor',
  'secondaryColor'
];

const generateCode = () => {
  let raw = '';
  for (let index = 0; index < 12; index += 1) raw += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return raw.match(/.{4}/g).join('-');
};

const normalizeCode = (value) => {
  const raw = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return raw.length === 12 ? raw.match(/.{4}/g).join('-') : null;
};

const clean = (payload) => {
  const data = { ...payload };
  if (data.completionDate === '') data.completionDate = null;
  if (data.hours === '') data.hours = null;
  return data;
};

const listCertificates = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.status === 'valid' || req.query.status === 'revoked') filter.status = req.query.status;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ studentName: regex }, { courseName: regex }, { serial: regex }, { code: regex }];
  }

  const [items, total] = await Promise.all([
    Certificate.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Certificate.countDocuments(filter)
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, items, 'Certificates fetched successfully', getMeta(total, page, limit)));
});

const createCertificate = asyncHandler(async (req, res) => {
  const payload = clean(pick(req.body, CREATE_FIELDS));
  const settings = await CertificateSettings.getSettings();
  const year = new Date(payload.issueDate).getUTCFullYear();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const sequence = await CertificateSettings.nextSequence();
    try {
      const certificate = await Certificate.create({
        ...payload,
        code: generateCode(),
        serial: `${settings.prefix}-${year}-${String(sequence).padStart(5, '0')}`,
        createdBy: req.admin._id
      });
      return res.status(201).json(new ApiResponse(201, certificate, 'Certificate created successfully'));
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }

  throw new ApiError(500, 'Could not generate a unique certificate code');
});

const updateCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  if (!certificate) throw new ApiError(404, 'Certificate not found');
  certificate.set(clean(pick(req.body, CREATE_FIELDS)));
  await certificate.save();
  res.status(200).json(new ApiResponse(200, certificate, 'Certificate updated successfully'));
});

const revokeCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  if (!certificate) throw new ApiError(404, 'Certificate not found');

  if (req.body.revoked) {
    certificate.status = 'revoked';
    certificate.revokedAt = new Date();
    certificate.revokedReason = String(req.body.reason || '').trim();
  } else {
    certificate.status = 'valid';
    certificate.revokedAt = null;
    certificate.revokedReason = '';
  }

  await certificate.save();
  res.status(200).json(new ApiResponse(200, certificate, 'Certificate status updated successfully'));
});

const deleteCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  if (!certificate) throw new ApiError(404, 'Certificate not found');
  await certificate.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Certificate deleted successfully'));
});

const sendOnWhatsApp = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id).lean();
  if (!certificate) throw new ApiError(404, 'Certificate not found');
  if (certificate.status !== 'valid') throw new ApiError(400, 'A revoked certificate cannot be sent');
  if (!req.file) throw new ApiError(400, 'PDF file is required');
  if (req.file.buffer.subarray(0, 4).toString() !== '%PDF') throw new ApiError(400, 'The file is not a PDF');

  const site = String(process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const lines = [
    `شهادة ${certificate.studentName}`,
    certificate.courseName,
    `الرقم التسلسلي: ${certificate.serial}`
  ];
  if (site) lines.push(`للتحقق: ${site}/verify/${certificate.code}`);

  await whatsapp.sendDocument({
    phone: req.body.phone,
    buffer: req.file.buffer,
    fileName: `${certificate.serial}.pdf`,
    caption: lines.join('\n')
  });

  res.status(200).json(new ApiResponse(200, null, 'Certificate sent on WhatsApp'));
});

const getSettings = asyncHandler(async (req, res) => {
  const doc = await CertificateSettings.getSettings();
  res.status(200).json(new ApiResponse(200, doc, 'Settings fetched successfully'));
});

const updateSettings = asyncHandler(async (req, res) => {
  const current = await CertificateSettings.getSettings();
  const payload = pick(req.body, SETTINGS_FIELDS);
  const previous = current.signature ? current.signature.publicId : '';

  const doc = await CertificateSettings.findOneAndUpdate(
    { key: 'main' },
    { $set: payload },
    { new: true, runValidators: true }
  );

  if (payload.signature && previous && previous !== doc.signature.publicId) await destroyAsset(previous);
  res.status(200).json(new ApiResponse(200, doc, 'Settings updated successfully'));
});

const verifyCertificate = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const code = normalizeCode(req.params.code);
  const certificate = code ? await Certificate.findOne({ code }).lean() : null;

  if (!certificate) {
    return res.status(404).json(new ApiResponse(404, { valid: false }, 'Certificate not found'));
  }

  const data = {
    valid: certificate.status === 'valid',
    status: certificate.status,
    serial: certificate.serial,
    studentName: certificate.studentName,
    courseName: certificate.courseName,
    hours: certificate.hours,
    grade: certificate.grade,
    issueDate: certificate.issueDate,
    completionDate: certificate.completionDate,
    revokedAt: certificate.revokedAt
  };

  return res.status(200).json(new ApiResponse(200, data, 'Certificate verified'));
});

module.exports = {
  listCertificates,
  createCertificate,
  updateCertificate,
  revokeCertificate,
  deleteCertificate,
  sendOnWhatsApp,
  getSettings,
  updateSettings,
  verifyCertificate
};