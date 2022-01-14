import express, { Request, Response } from 'express';
import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { AuthManager } from '../managers/AuthManager';

class AuthController {
  public _urlPath = '/auth';
  public _router = express.Router();
  public _authManager: AuthManager = container.get<AuthManager>(AuthManager);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.post(this._urlPath, this.performAuthWithAWS);
    this._router.post(`${this._urlPath}/refresh`, this.GetNewJWTTokenFromAWS);
    return;
  }

  performAuthWithAWS = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'AuthorizeType');
      const result = await this._authManager.performAuthWithAWS(
        requestDetail.data
      );
      response.send({
        jwtToken: result['idToken']['jwtToken'],
        refreshToken: result['refreshToken']['token'],
        userId: result['idToken']['payload']['sub'],
      });
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  GetNewJWTTokenFromAWS = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(
        request,
        'AuthorizeRefreshTokenType'
      );
      const result = await this._authManager.GetNewJWTTokenFromAWS(
        requestDetail.data
      );
      response.send(result['idToken']['jwtToken']);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
}

export default AuthController;
