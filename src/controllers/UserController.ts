import express, { NextFunction, Request, Response } from 'express';

import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeUserRoutes } from '../routes/UserRoutes';

import { Transformer } from './../libs/TransformerClass';

class UserController {
  public _urlPath = '/user';
  public _router = express.Router();
  private _redisCache: Redis = container.get<Redis>(Redis);

  private _WorkspaceLabel = 'USER_WORKSPACE';

  public _transformer: Transformer = container.get<Transformer>(Transformer);

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
      const result = await response.locals.invoker('updateUserDetails', {
        payload: data,
        sendRawBody: true,
      });
      await response.locals.broadcaster({
        operationType: 'UPDATE',
        entityType: 'USER',
        entityId: userId,
      });
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };


  addExistingUserToWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    const data = new RequestClass(request).data;
    const userSpecificKey = this._transformer.encodeCacheKey(
      this._WorkspaceLabel,
      response.locals.userId,
    );
    try {
      const result = await response.locals.invoker('addExistingUserToWorkspace', {
        payload: data,
        sendRawBody: true,
      });
      await this._redisCache.del(userSpecificKey)
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateActiveWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    const data = new RequestClass(request).data;

    try {
      await response.locals.invoker('updateActiveWorkspace', {
        payload: data,
        sendRawBody: true,
      });
      response.status(statusCodes.NO_CONTENT).send()
    } catch (error) {
      next(error);
    }
  };

  updateUserPreference = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = response.locals.userIdRaw;
      const requestDetail = new RequestClass(request, 'UserPreference').data;
      requestDetail.id = userId;

      const result = await response.locals.invoker('updateUserPreference', {
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
      const result = await response.locals.invoker('getUser');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getInvite = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const inviteId = request.params.inviteId;
      const result = await response.locals.invoker('getInvite', {
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
      await response.locals.invoker('deleteInvite', {
        pathParameters: { inviteId: inviteId },
      });

      response.status(statusCodes.NO_CONTENT).json();
    } catch (error) {
      next(error);
    }
  };

  getInvitesOfWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const result = await response.locals.invoker('getAllInviteOfWorkspace');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUsersOfWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const result = await response.locals.invoker('getUsersOfWorkspace');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createInvite = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const payload = new RequestClass(request, 'InviteProperties').data;
      const result = await response.locals.invoker('createInvite', {
        payload: payload,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const result = await response.locals.invoker('getById', {
        pathParameters: { userId: request.params.id },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
  getByMail = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const result = await response.locals.invoker('getByEmail', {
        pathParameters: { email: request.params.mail },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUserByLinkedin = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const payload = request.body;
      payload.linkedinURL = payload.linkedinURL.replace(/\/+$/, '');
      const result = await response.locals.invoker('getUserByLinkedin', {
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
      const registerStatus = await response.locals.invoker('registerStatus');

      response.status(statusCodes.OK).send(registerStatus);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
