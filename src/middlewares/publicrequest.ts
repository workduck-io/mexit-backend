import { NextFunction, Request, Response } from 'express';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
import {
  PublicAccessCreds,
  initialPublicCreds,
  refreshAccessCreds,
} from '../libs/publicAccessToken';

let accessCreds: PublicAccessCreds = initialPublicCreds();

// Middleware to supply a system token for accessing endpoints that are public
async function PublicRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (accessCreds.accessToken && Date.now() < accessCreds.expiry) {
      req.headers.authorization = accessCreds.idToken;
      next();
    } else {
      accessCreds = await refreshAccessCreds(accessCreds.refreshToken);
      req.headers.authorization = accessCreds.idToken;
      next();
    }
  } catch (error) {
    res.status(statusCodes.INTERNAL_SERVER_ERROR).send({
      message: error.message,
      statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      errorCode: errorCodes.UNKNOWN,
    });
  }
}

export { PublicRequest };
