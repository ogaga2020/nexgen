import path from 'path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = path.join(process.cwd(), 'logs');

const rotate = new DailyRotateFile({
  dirname: logDir,
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxFiles: '30d',
  level: 'info',
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [rotate],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      level: 'debug',
    })
  );
}

export default logger;
