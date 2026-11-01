const format = (level, message) => `[${new Date().toISOString()}] [${level}] ${message}`;

const logger = {
  info: (message) => console.log(format('INFO', message)),
  warn: (message) => console.warn(format('WARN', message)),
  error: (message) => console.error(format('ERROR', message)),
  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') console.debug(format('DEBUG', message));
  }
};

module.exports = logger;