import { NextFunction, Request, Response } from 'express';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
async function GoogleAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.headers['mex-google-access-token'])
      throw new Error('mex-google-access-token header is missing');
    if (!req.headers['mex-google-id-token'])
      throw new Error('mex-google-id-token header is missing');

    res.locals.bearerToken = `Bearer ${req.headers['mex-google-access-token']}`;
    res.locals.idToken = `Bearer ${req.headers['mex-google-id-token']}`;
    next();
  } catch (error) {
    res.status(statusCodes.FORBIDDEN).send({
      message: error.message,
      statusCode: statusCodes.FORBIDDEN,
      errorCode: errorCodes.AUTH_ERROR,
    });
  }
}

export { GoogleAuth };
