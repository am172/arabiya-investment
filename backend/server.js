const http = require('http');
const env = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');
const app = require('./src/app');
const whatsapp = require('./src/services/whatsapp/whatsapp.service');
const server = http.createServer(app);

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

let shuttingDown = false;

const shutdown = async (signal, exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.warn(`${signal} received. Shutting down gracefully`);

  const forceExit = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  server.close(async () => {
    try {
      await disconnectDB();
      logger.info('Shutdown complete');
      process.exit(exitCode);
    } catch (error) {
      logger.error(`Error during shutdown: ${error.message}`);
      process.exit(1);
    }
  });
};

const start = async () => {
  try {
    await connectDB();
    
    logger.info(
      `Features: geoip=${process.env.GEOIP_ENABLED === 'true' ? 'on' : 'off'}, whatsapp=${process.env.WHATSAPP_ENABLED === 'true' ? 'on' : 'off'
      }`
    );
    whatsapp.autoStart().catch((error) => logger.error(`WhatsApp auto start failed: ${error.message}`));
    server.listen(env.port, () => {
      logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason instanceof Error ? reason.message : reason}`);
  shutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  shutdown('uncaughtException', 1);
});

start();