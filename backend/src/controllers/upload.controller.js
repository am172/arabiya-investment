const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { cloudOptions } = require('../services/cloudinary.service');
const crypto = require('crypto');

const ROOT_FOLDER = process.env.CLOUDINARY_ROOT_FOLDER || 'arabiya';
const FOLDERS = ['catalog', 'documents', 'banners', 'branding', 'avatars', 'videos', 'thumbnails', 'general'];
const resolveFolder = (value) => {
  const folder = FOLDERS.includes(value) ? value : 'general';
  return `${ROOT_FOLDER}/${folder}`;
};

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) =>
      error ? reject(error) : resolve(result)
    );
    stream.end(buffer);
  });

const uploadLargeFile = (filePath, options) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(filePath, options, (error, result) =>
      error ? reject(error) : resolve(result)
    );
  });

const removeTempFile = async (filePath) => {
  if (!filePath) return;
  await fs.promises.unlink(filePath).catch(() => {});
};

const formatAsset = (result, cloudName) => {
  const asset = {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format,
    bytes: result.bytes
  };
  if (result.width) asset.width = result.width;
  if (result.height) asset.height = result.height;
  if (result.resource_type === 'video') {
    asset.duration = Math.round(result.duration || 0);
    asset.thumbnailUrl = cloudinary.url(result.public_id, {
      cloud_name: cloudName,
      resource_type: 'video',
      format: 'jpg',
      secure: true,
      start_offset: 'auto'
    });
  }
  return asset;
};

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Image file is required');

  const options = await cloudOptions({
    folder: resolveFolder(req.body.folder),
    resource_type: 'image',
    unique_filename: true,
    overwrite: false
  });

  let result;
  try {
    result = await uploadBuffer(req.file.buffer, options);
  } catch (error) {
    throw new ApiError(502, `Image upload failed: ${error.message}`);
  }

  res.status(201).json(new ApiResponse(201, formatAsset(result, options.cloud_name), 'Image uploaded successfully'));
});

const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Video file is required');

  let options;
  let result;
  try {
    options = await cloudOptions({
      folder: resolveFolder(req.body.folder || 'videos'),
      resource_type: 'video',
      chunk_size: 6000000,
      unique_filename: true,
      overwrite: false
    });
    result = await uploadLargeFile(req.file.path, options);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, `Video upload failed: ${error.message}`);
  } finally {
    await removeTempFile(req.file.path);
  }

  res.status(201).json(new ApiResponse(201, formatAsset(result, options.cloud_name), 'Video uploaded successfully'));
});

const deleteAsset = asyncHandler(async (req, res) => {
  const publicId = String(req.query.publicId || '').trim();
    const resourceType = ['video', 'raw'].includes(req.query.resourceType) ? req.query.resourceType : 'image';

  if (!publicId.startsWith(`${ROOT_FOLDER}/`) || publicId.includes('..')) {
    throw new ApiError(400, 'Invalid public id');
  }

  const options = await cloudOptions({ resource_type: resourceType, invalidate: true });

  let result;
  try {
    result = await cloudinary.uploader.destroy(publicId, options);
  } catch (error) {
    throw new ApiError(502, `Asset deletion failed: ${error.message}`);
  }

  if (result.result !== 'ok') throw new ApiError(404, 'Asset not found');

  res.status(200).json(new ApiResponse(200, null, 'Asset deleted successfully'));
});

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'PDF file is required');
  if (req.file.buffer.subarray(0, 4).toString() !== '%PDF') throw new ApiError(400, 'The file is not a PDF');

  const options = await cloudOptions({
    public_id: `${ROOT_FOLDER}/documents/${crypto.randomUUID()}.pdf`,
    resource_type: 'raw',
    unique_filename: false,
    overwrite: false
  });

  let result;
  try {
    result = await uploadBuffer(req.file.buffer, options);
  } catch (error) {
    throw new ApiError(502, `Document upload failed: ${error.message}`);
  }

  res.status(201).json(
    new ApiResponse(
      201,
      {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: 'raw',
        format: 'pdf',
        bytes: result.bytes,
        name: req.file.originalname
      },
      'Document uploaded successfully'
    )
  );
});

module.exports = { uploadImage, uploadVideo, uploadDocument, deleteAsset };


