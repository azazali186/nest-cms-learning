// logger.ts
import * as winston from 'winston';

const errorTransport = new winston.transports.File({
  filename: 'log/error.log',
  level: 'error',
});

const warnTransport = new winston.transports.File({
  filename: 'log/warn.log',
  level: 'warn',
});

const infoTransport = new winston.transports.File({
  filename: 'log/access.log',
  level: 'info',
});

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [errorTransport, warnTransport, infoTransport],
});

export default logger;
