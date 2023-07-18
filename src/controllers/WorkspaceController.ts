import express, { NextFunction, Request, Response } from 'express';

import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { initializeWorkspaceRoutes } from '../routes/WorkspaceRoutes';

class WorkspaceController {
  public _urlPath = '/workspace';
  public _router = express.Router();

  public _transformer: Transformer = container.get<Transformer>(Transformer);
  private _redisCache: Redis = container.get<Redis>(Redis);
  private _WorkspaceLabel = 'USER_WORKSPACE';

  constructor() {
    initializeWorkspaceRoutes(this);
  }

  updateWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    const userSpecificKey = this._transformer.encodeCacheKey(this._WorkspaceLabel, response.locals.userId);
    const data = new RequestClass(request).data;
    try {
      await response.locals.invoker('updateWorkspace', {
        payload: { ...data, type: 'WorkspaceRequest' },
      });
      await response.locals.broadcaster({
        operationType: 'UPDATE',
        entityType: 'WORKSPACE',
        entityId: data.id,
      });
      await this._redisCache.del(userSpecificKey);

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getWorkspaceByIds = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    const data = new RequestClass(request).data;
    const ids = data.ids;

    try {
      const result = await response.locals.invoker('getWorkspaceByIds', {
        pathParameters: {
          ids: ids?.join(','),
        },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllWorkspacesOfUser = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
      const userSpecificKey = this._transformer.encodeCacheKey(this._WorkspaceLabel, response.locals.userId);
      const result = await this._redisCache.getOrSet({ key: userSpecificKey }, () => {
        return response.locals.invoker('getAllWorkspaceOfUser');
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default WorkspaceController;
