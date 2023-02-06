import { ErrorRequestHandler } from 'express';

import logger from '../libs/logger';
import { IWDErrorResponse } from '../libs/WDError';

export const jsonErrorHandler: ErrorRequestHandler = async (
  err,
  req,
  res,
  next
) => {
  const { response } = err;
  const error: IWDErrorResponse = response;
  if (!res) next();
  logger.error(error);
  res.setHeader('Content-Type', 'application/json');
  res.status(parseInt(error?.statusCode?.toString())).send(error);
};
