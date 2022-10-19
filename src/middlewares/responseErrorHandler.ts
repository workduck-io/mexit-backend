import { statusCodes } from './../libs/statusCodes';
import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import logger from '../libs/logger';
import { WDError } from '@workduck-io/wderror';

const responseErrorHandler: ErrorRequestHandler = (
  error: WDError,
  request: Request,
  response: Response,
  next: NextFunction // eslint-disable-line
) => {
  const statusCode: number =
    error.response?.statusCode ?? statusCodes.INTERNAL_SERVER_ERROR;
  const message = error.response?.message ?? error.message;
  const clientIp =
    request.headers['x-forwarded-for']?.toString().split(',')[0] ||
    request.socket.remoteAddress;

  if (statusCode >= 400 && statusCode < 500) {
    logger.warn(
      `HTTP [${request.method}] ${request.url} - ${statusCode} ${message} | client IP ${clientIp}`
    );
  } else if (statusCode >= 500) {
    const workspaceId = request.headers['mex-workspace-id'];

    if (workspaceId)
      logger.info(
        `HTTP [${request.method}] ${request.url} | ${workspaceId} | client IP ${clientIp}`
      );
    else
      logger.error(
        `HTTP [${request.method}] ${request.url} - ${statusCode} ${message} | client IP ${clientIp}`
      );

    logger.error(`Call Stack ${error.response?.stackTrace ?? error.stack}`);
  }

  response.status(statusCode).json({
    message: message,
    statusCode: statusCode,
  });
};

export default responseErrorHandler;
