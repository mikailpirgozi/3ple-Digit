import winston from 'winston';
import { env } from './env';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

// Create logger instance
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      ),
    }),
  ],
});

// Add file transport for production
if (env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    })
  );
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json(),
    })
  );
}

// Helper functions for structured logging
export const log = {
  error: (message: string, meta?: Record<string, unknown>) => {
    logger.error(message, meta);
  },
  
  warn: (message: string, meta?: Record<string, unknown>) => {
    logger.warn(message, meta);
  },
  
  info: (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, meta);
  },
  
  debug: (message: string, meta?: Record<string, unknown>) => {
    logger.debug(message, meta);
  },
  
  // Request logging helper
  request: (req: { method: string; url: string; ip?: string }, meta?: Record<string, unknown>) => {
    logger.info(`${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      ...meta,
    });
  },
  
  // Database operation logging
  db: (operation: string, table: string, meta?: Record<string, unknown>) => {
    logger.debug(`DB ${operation} on ${table}`, {
      operation,
      table,
      ...meta,
    });
  },
};
