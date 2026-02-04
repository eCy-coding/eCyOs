
import winston from 'winston';
import path from 'path';

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define formats
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

// Create the logger
const logger = winston.createLogger({
  levels,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format,
      level: 'debug', // Log everything in dev
    }),
    // File transport for all logs (JSON for easy parsing by Admin Console)
    // File transport for all logs (JSON for easy parsing by Admin Console)
    // Roling File Strategy: Max 5MB per file, Max 5 files
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

export default logger;
