import winston from 'winston';
import 'winston-daily-rotate-file';
import { env } from '../../config/env';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, requestId, stack }) => {
  const reqIdStr = requestId ? ` [ReqID: ${requestId}]` : '';
  return `${timestamp}${reqIdStr} [${level}]: ${stack || message}`;
});

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  format: combine(timestamp(), json()),
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    fileRotateTransport,
  ],
});

// If we're not in production then log to the console with colors
if (env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    })
  );
}
