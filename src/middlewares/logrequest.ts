import { NextFunction, Request, Response } from 'express';
import logger from '../libs/logger';
import geoip from 'geoip-lite';

async function LogRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.url.includes('ping')) {
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress;
    const clientLocation = geoip.lookup(clientIp);
    const workspaceId = req.headers['mex-workspace-id'];

    if (workspaceId)
      logger.info(
        `HTTP [${req.method}] ${req.url} | ${workspaceId} | client IP ${clientIp} | LatLong ${clientLocation?.ll} | ${clientLocation?.city}, ${clientLocation?.region}, ${clientLocation?.country}`
      );
    else
      logger.info(
        `HTTP [${req.method}] ${req.url} | client IP ${clientIp} | LatLong ${clientLocation?.ll} | ${clientLocation?.city}, ${clientLocation?.region}, ${clientLocation?.country}`
      );
  }
  next();
}

export { LogRequest };
