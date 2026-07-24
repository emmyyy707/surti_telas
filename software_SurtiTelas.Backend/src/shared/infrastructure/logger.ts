import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const isDevelopment = process.env.NODE_ENV !== 'production';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  isDevelopment
    ? winston.format.colorize()
    : winston.format.json()
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    stderrLevels: ['error', 'warn', 'debug', 'info'],
  }),
];

if (!isDevelopment) {
  transports.push(
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format((info) => {
          if (info.requestId) {
            info.message = `[${info.requestId}] ${info.message}`;
          }
          return info;
        })(),
        logFormat
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: winston.format.combine(
        winston.format((info) => {
          if (info.requestId) {
            info.message = `[${info.requestId}] ${info.message}`;
          }
          return info;
        })(),
        logFormat
      ),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  format: winston.format.combine(
    winston.format((info) => {
      if (info.requestId) {
        info.message = `[${info.requestId}] ${info.message}`;
      }
      return info;
    })(),
    logFormat
  ),
  transports,
});

export { logger };
