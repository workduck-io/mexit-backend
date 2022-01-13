import { ErrorRequestHandler } from 'express';
import { IWDErrorResponse } from '../libs/WDError';

export const jsonErrorHandler: ErrorRequestHandler = async (err, req, res) => {
  const { response } = err;
  const error: IWDErrorResponse = response;
  res.setHeader('Content-Type', 'application/json');
  res.status(parseInt(error.statusCode.toString())).send(error);
};
