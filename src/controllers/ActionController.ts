import express, { NextFunction, Request, Response } from 'express';

import { STAGE } from '../env';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeActionRoutes } from '../routes/ActionRoutes';

class ActionController {
  public _urlPath = '/actiongroup';
  public _router = express.Router();
  private _redisCache: Redis = container.get<Redis>(Redis);

  private _lambdaName = {
    action: {
      getAll: `actionHelperService-${STAGE}-getAllActionGroups`,
      get: `actionHelperService-${STAGE}-getAction`,
    },
    auth: {
      get: `authService-${STAGE}-getAuth`,
      getAll: `authService-${STAGE}-getAllAuths`,
      update: `authService-${STAGE}-updateCurrentWorkspace`,
      refresh: `authService-${STAGE}-refreshWorkspaceAuth`,
    },
  };

  constructor() {
    initializeActionRoutes(this);
  }

  getAction = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const managerResponse = response.locals.invoker(
        this._lambdaName.action.get,
        'getAction',
        {
          pathParameters: {
            actionGroupId: request.params.groupId,
            actionId: request.params.actionId,
          },
        }
      );

      const result = await this._redisCache.getOrSet(
        {
          key: request.params.actionId,
        },
        () => managerResponse
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllActions = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._redisCache.getOrSet(
        {
          key: request.params.groupId,
        },
        async () =>
          await response.locals.invoker(
            this._lambdaName.action.getAll,
            'getActionsOfActionGroup',
            {
              pathParameters: { actionGroupId: request.params.groupId },
            }
          )
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllAuth = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._lambdaName.auth.getAll,
        'getAllAuths'
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAuth = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._lambdaName.auth.get,
        'getAuth',
        { pathParameters: { authTypeId: request.params.authId } }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  refreshAuth = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._lambdaName.auth.refresh,
        'refreshAuth',
        { pathParameters: { source: request.params.source } }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateAuth = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = new RequestClass(request).data;

      const result = await response.locals.invoker(
        this._lambdaName.auth.update,
        'updateAuth',
        {
          pathParameters: { authTypeId: request.params.authId, payload: data },
        }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default ActionController;
