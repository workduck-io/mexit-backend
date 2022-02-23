import winston from 'winston';

const loggerFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${level}] ${message} ${timestamp}`;
});
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
