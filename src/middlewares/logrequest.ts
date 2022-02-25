import { NextFunction, Request, Response } from 'express';
import logger from '../libs/logger';

async function LogRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logger.info(`HTTP [${req.method}] ${req.url}}`);
  next();
}

export { LogRequest };
