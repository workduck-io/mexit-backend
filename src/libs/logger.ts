import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import crypto from 'crypto';
import { AWS_REGION } from '../env';
const loggerFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${level}] ${message} ${timestamp}`;
});
const startTime = new Date().toISOString();
const developmentLogger = () =>
  winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      loggerFormat
    ),
    transports: [new winston.transports.Console()],
  });

const productionLogger = () =>
  winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.timestamp(), loggerFormat),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
      new WinstonCloudWatch({
        logGroupName: 'mexit-backend-prod',
        logStreamName: function () {
          // Spread log streams across dates as the server stays up
          let date = new Date().toISOString().split('T')[0];
          return (
            'mexit-backend-prod-' +
            date +
            '-' +
            crypto.createHash('md5').update(startTime).digest('hex')
          );
        },
        awsRegion: AWS_REGION,
      }),
    ],
  });

const defaultLogger = () =>
  winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.timestamp(), loggerFormat),
    transports: [new winston.transports.Console()],
  });

let logger = undefined;

if (process.env.NODE_ENV === 'development') {
  logger = developmentLogger();
} else if (process.env.NODE_ENV === 'production') {
  logger = productionLogger();
} else {
  logger = defaultLogger();
}

export default logger;
