import { NextFunction, Request, Response } from 'express';

import logger from '../libs/logger';

async function LogRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.url.includes('ping')) {
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress;
    const workspaceId = req.headers['mex-workspace-id'];

    if (workspaceId)
      logger.info(
        `HTTP [${req.method}] ${req.url} | ${workspaceId} | client IP ${clientIp}`
      );
    else logger.info(`HTTP [${req.method}] ${req.url} | client IP ${clientIp}`);
  }
  next();
}

export { LogRequest };
