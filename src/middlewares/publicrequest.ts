import { NextFunction, Request, Response } from 'express';

import { DefaultAccessCreds } from '@workduck-io/mex-default-user-token';
import { PublicAccessCreds } from '@workduck-io/mex-default-user-token/src/lib/types/accessCred';

import { COGNITO_CLIENT_ID } from '../env';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';

let accessCreds: PublicAccessCreds;
const defaultAcessCreds = new DefaultAccessCreds(
  process.env.MEX_DEFAULT_USER_REFRESH_TOKEN,
  COGNITO_CLIENT_ID,
  () => accessCreds,
  cred => (accessCreds = cred)
);
// Middleware to supply a system token for accessing endpoints that are public
async function PublicRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const access_token = await defaultAcessCreds.getCred();
    req.headers.authorization = access_token.idToken;
    next();
  } catch (error) {
    res.status(statusCodes.INTERNAL_SERVER_ERROR).send({
      message: error.message,
      statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      errorCode: errorCodes.UNKNOWN,
    });
  }
}

export { PublicRequest };
