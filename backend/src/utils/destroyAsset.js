const cloudinary = require('../config/cloudinary');
const { cloudOptions } = require('../services/cloudinary.service');

const destroyAsset = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    const options = await cloudOptions({ resource_type: resourceType, invalidate: true });
    await cloudinary.uploader.destroy(publicId, options);
  } catch (error) {
    console.error(`Failed to delete asset ${publicId}:`, error.message);
  }
};

module.exports = destroyAsset;