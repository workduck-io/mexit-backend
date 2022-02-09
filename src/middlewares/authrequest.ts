import { NextFunction, Request, Response } from 'express';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
import { TokenHandler } from '../libs/tokenvalidator';
// Authenticates the user for accessing
// the endpoint routes.
async function AuthRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // remove the 'Bearer ' token from the auth token
  const token = req.headers.authorization?.replace('Bearer ', '');
  try {
    if (!token) throw new Error('Access denied. No token provided');

    const result = await TokenHandler({ token });
    if (result.isValid) {
      res.locals.userEmail = result.userEmail;
      next();
    } else throw new Error(result.error);
  } catch (error) {
    res.status(statusCodes.FORBIDDEN).send({
      message: error.message,
      statusCode: statusCodes.FORBIDDEN,
      errorCode: errorCodes.AUTH_ERROR,
    });
  }
}

export { AuthRequest };
