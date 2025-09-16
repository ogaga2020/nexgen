import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const level = process.env.LOG_LEVEL || 'info';
const isDev = process.env.NODE_ENV !== 'production';
const isServerless =
  !!(process.env.NETLIFY ||
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.AWS_EXECUTION_ENV);

const transportList: any[] = [];

if (!isServerless) {
  const logDir = path.join(process.cwd(), 'logs');
  try {
    if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });
    transportList.push(
      new DailyRotateFile({
        dirname: logDir,
        filename: '%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxFiles: '30d',
        level,
      })
    );
  } catch {
    transportList.push(
      new transports.Console({
        level,
        format: isDev
          ? format.combine(format.colorize(), format.simple())
          : format.json(),
      })
    );
  }
} else {
  transportList.push(
    new transports.Console({
      level,
      format: format.json(),
    })
  );
}

if (isDev && !transportList.some(t => t instanceof transports.Console)) {
  transportList.push(
    new transports.Console({
      level: 'debug',
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: transportList,
});

export default logger;
