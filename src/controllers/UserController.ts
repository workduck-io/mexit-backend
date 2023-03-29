import express, { NextFunction, Request, Response } from 'express';

import { STAGE } from '../env';
import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeUserRoutes } from '../routes/UserRoutes';

import { Transformer } from './../libs/TransformerClass';

class UserController {
  public _urlPath = '/user';
  public _router = express.Router();

  public _transformer: Transformer = container.get<Transformer>(Transformer);

  private _userLambdaFunctionName = `workduck-user-service-${STAGE}-user`;
  private _getUserLambdaFunctionName = `workduck-user-service-${STAGE}-getUser`;
  private _userMexBackendLambdaFunctionName = `mex-backend-${STAGE}-User:latest`;
  private _registerStatusLambdaFunctionName = `workduck-user-service-${STAGE}-registerStatus`;
  private _inviteUserLambdaFunctionName = `workduck-user-service-${STAGE}-invite`;

  constructor() {
    initializeUserRoutes(this);
  }

  updateUser = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    const userId = response.locals.userIdRaw;
    const data = new RequestClass(request, 'User').data;
    data.id = userId;

    if (data.linkedinURL) {
      data.linkedinURL = data.linkedinURL.replace(/\/+$/, '');
    }

    try {
      const result = await response.locals.lambdaInvoker(this._userLambdaFunctionName, 'updateUserDetails', {
        payload: data,
        sendRawBody: true,
      });
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateUserPreference = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = response.locals.userIdRaw;
      const requestDetail = new RequestClass(request, 'UserPreference').data;
      requestDetail.id = userId;

      const result = await response.locals.lambdaInvoker(this._userLambdaFunctionName, 'updateUserPreference', {
        payload: requestDetail,
        sendRawBody: true,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  get = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const result = await response.locals.lambdaInvoker(this._getUserLambdaFunctionName, 'getUser');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getInvite = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const inviteId = request.params.inviteId;
      const result = await response.locals.lambdaInvoker(this._inviteUserLambdaFunctionName, 'getInvite', {
        pathParameters: { inviteId: inviteId },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteInvite = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const inviteId = request.params.inviteId;
      await response.locals.lambdaInvoker(this._inviteUserLambdaFunctionName, 'deleteInvite', {
        pathParameters: { inviteId: inviteId },
      });

      response.status(statusCodes.NO_CONTENT).json();
    } catch (error) {
      next(error);
    }
  };

  getInvitesOfWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const result = await response.locals.lambdaInvoker(this._inviteUserLambdaFunctionName, 'getAllInviteOfWorkspace');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createInvite = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const payload = new RequestClass(request, 'InviteProperties').data;
      const result = await response.locals.lambdaInvoker(this._inviteUserLambdaFunctionName, 'createInvite', {
        payload: payload,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const result = await response.locals.lambdaInvoker(this._getUserLambdaFunctionName, 'getById', {
        pathParameters: { userId: request.params.id },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
  getByMail = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const result = await response.locals.lambdaInvoker(this._getUserLambdaFunctionName, 'getByEmail', {
        pathParameters: { email: request.params.mail },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
  getUsersOfWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const result = await response.locals.lambdaInvoker(this._userLambdaFunctionName, 'getUsersOfWorkspace');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
  getUserByLinkedin = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const payload = request.body;
      payload.linkedinURL = payload.linkedinURL.replace(/\/+$/, '');
      const result = await response.locals.lambdaInvoker(this._getUserLambdaFunctionName, 'getUserByLinkedin', {
        payload: payload,
        sendRawBody: true,
      });

      response.status(statusCodes.OK).json({
        mex_user: result.length > 0 ? true : false,
      });
    } catch (error) {
      next(error);
    }
  };

  registerStatus = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const registerStatus = await response.locals.lambdaInvoker(
        this._registerStatusLambdaFunctionName,
        'registerStatus'
      );

      response.status(statusCodes.OK).send(registerStatus);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
