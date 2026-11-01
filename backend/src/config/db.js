const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (error) => logger.error(`MongoDB error: ${error.message}`));

  await mongoose.connect(env.mongoUri, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    autoIndex: true
  });

  return mongoose.connection;
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(false);
  }
};

module.exports = { connectDB, disconnectDB };