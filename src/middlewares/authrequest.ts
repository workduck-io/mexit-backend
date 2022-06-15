import { NextFunction, Request, Response } from 'express';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
import { TokenHandler } from '../libs/tokenvalidator';
import WDError from '../libs/WDError';
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
      res.locals.userId = result.userId.replace(/-/g, '');
      res.locals.userIdRaw = result.userId;
      res.locals.idToken = req.headers.authorization;

      const headerNeeded = () => {
        const noHeaderPaths = ['/user/register', '/public'];
        const url = req.url;

        for (const path of noHeaderPaths) {
          if (url.includes(path)) return false;
        }
        return true;
      };

      if (headerNeeded()) {
        if (req.headers['mex-workspace-id'])
          res.locals.workspaceID = req.headers['mex-workspace-id'].toString();
        else
          throw new WDError({
            statusCode: statusCodes.BAD_REQUEST,
            code: statusCodes.BAD_REQUEST,
            message: 'mex-workspace-id header missing',
          });
      }
      next();
    } else
      throw new WDError({
        statusCode: statusCodes.UNAUTHORIZED,
        message: result.error,
        code: statusCodes.UNAUTHORIZED,
      });
  } catch (error) {
    next(error);
  }
}

export { AuthRequest };
