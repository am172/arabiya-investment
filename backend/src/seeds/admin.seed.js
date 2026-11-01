const Admin = require('../models/Admin.model');
const ROLES = require('../constants/roles');
const logger = require('../utils/logger');

const seedAdmin = async ({ force = false } = {}) => {
  const email = String(process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required');
  }
  if (password.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters');
  }

  const existing = await Admin.findOne({ email }).select('+password');

  if (existing && !force) {
    logger.info(`Admin already exists: ${email}`);
    return;
  }

  if (existing) {
    existing.name = name;
    existing.password = password;
    existing.role = ROLES.SUPER_ADMIN;
    existing.isActive = true;
    await existing.save();
    logger.info(`Admin updated: ${email}`);
    return;
  }

  await Admin.create({ name, email, password, role: ROLES.SUPER_ADMIN });
  logger.info(`Admin created: ${email}`);
};

module.exports = seedAdmin;