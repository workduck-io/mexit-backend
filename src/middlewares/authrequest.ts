import { WDError } from '@workduck-io/wderror';
import { validate } from '@workduck-io/workspace-validator';
import { NextFunction, Request, Response } from 'express';
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
    if (!token)
      throw new WDError({
        statusCode: statusCodes.BAD_REQUEST,
        message: 'Access denied. No token provided',
        code: statusCodes.BAD_REQUEST,
      });

    const result = await TokenHandler({ token });
    if (result.isValid) {
      res.locals.userEmail = result.userEmail;
      res.locals.userId = result.userId.replace(/-/g, '');
      res.locals.userIdRaw = result.userId;
      res.locals.idToken = req.headers.authorization;

      const headerNeeded = () => {
        const noHeaderPaths = ['/user', '/public', '/oauth2'];
        const headerWhitelist = ['/user/update'];
        const url = req.url;
        if (headerWhitelist.includes(url)) return true;
        for (const path of noHeaderPaths) {
          if (url.includes(path)) return false;
        }
        return true;
      };

      if (headerNeeded()) {
        const isValid = validate({
          headers: {
            'mex-workspace-id': req.headers['mex-workspace-id'] as string,
            Authorization: req.headers.authorization,
          },
        });

        if (isValid)
          res.locals.workspaceID = req.headers['mex-workspace-id'].toString();
        else
          throw new WDError({
            statusCode: statusCodes.BAD_REQUEST,
            code: statusCodes.BAD_REQUEST,
            message: 'Provided workspace is invalid',
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
