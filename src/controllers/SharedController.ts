import express, { NextFunction, Request, Response } from 'express';

import { STAGE } from '../env';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { initializeSharedRoutes } from '../routes/SharedRoutes';

class SharedController {
  public _urlPath = '/shared';
  public _router = express.Router();

  private _transformer: Transformer = container.get<Transformer>(Transformer);
  private _redisCache: Redis = container.get<Redis>(Redis);

  private _UserAccessLabel = 'USERACCESS';
  private _UserAccessTypeLabel = 'USERACCESSTYPE';
  private _nodeLambdaFunctionName = `mex-backend-${STAGE}-Node:latest`;

  constructor() {
    initializeSharedRoutes(this);
  }

  shareNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'ShareNodeDetail').data;
      await response.locals.invoker(this._nodeLambdaFunctionName, 'shareNode', {
        payload: {
          ...body,
          nodeID: body.nodeID,
          userIDs: body.userIDs,
        },
      });

      body.userIDs.forEach(userID => {
        this._redisCache.set(this._transformer.encodeCacheKey(this._UserAccessLabel, userID, body.nodeID), userID);
      });
      this._redisCache.del(this._transformer.encodeCacheKey(this._UserAccessTypeLabel, body.nodeID));
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  updateAccessTypeForSharedNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'UpdateAccessTypeForSharedNodeDetail').data;

      await response.locals.invoker(this._nodeLambdaFunctionName, 'updateAccessTypeForshareNode', {
        payload: { ...body, type: 'UpdateAccessTypesRequest' },
      });

      Object.keys(body.userIDToAccessTypeMap).forEach(userID => {
        this._redisCache.set(this._transformer.encodeCacheKey(this._UserAccessLabel, userID, body.nodeID), userID);
      });
      this._redisCache.del(this._transformer.encodeCacheKey(this._UserAccessTypeLabel + body.nodeID));
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  revokeNodeAccessForUsers = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = request.body;

      await response.locals.invoker(this._nodeLambdaFunctionName, 'revokeNodeAccessForUsers', {
        payload: {
          ...body,
          nodeID: body.nodeID,
          userIDs: body.userIDs,
        },
      });

      body.userIDs.forEach((userID: string) => {
        this._redisCache.del(this._transformer.encodeCacheKey(this._UserAccessLabel, userID, body.nodeID));
      });
      this._redisCache.del(this._transformer.encodeCacheKey(this._UserAccessTypeLabel, body.nodeID));
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getNodeSharedWithUser = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const nodeID = request.params.nodeId;

      const result = await response.locals.invoker(this._nodeLambdaFunctionName, 'getNodeSharedWithUser', {
        pathParameters: { nodeID: nodeID },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateSharedNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'UpdateShareNodeDetail').data;

      await response.locals.invoker(this._nodeLambdaFunctionName, 'updateSharedNode', {
        payload: { ...body, type: 'UpdateSharedNodeRequest' },
      });

      this._redisCache.del(body.id);
      response.status(statusCodes.NO_CONTENT).json();
    } catch (error) {
      next(error);
    }
  };

  getUserWithNodesShared = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const nodeId = request.params.nodeId;

      if (nodeId === '__null__') {
        response.status(statusCodes.BAD_REQUEST).send();
        return;
      }

      const result = await this._redisCache.getOrSet(
        {
          key: this._transformer.encodeCacheKey(this._UserAccessTypeLabel, nodeId),
        },
        () =>
          response.locals.invoker(this._nodeLambdaFunctionName, 'getUsersWithNodesShared', {
            pathParameters: { id: nodeId },
          })
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllNodesSharedForUser = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker(this._nodeLambdaFunctionName, 'getAllSharedNodeForUser');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getBulkSharedNodes = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const data = new RequestClass(request, 'GetMultipleIds').data;

      const result: any[] = await response.locals.invoker(this._nodeLambdaFunctionName, 'getNodeSharedWithUser', {
        allSettled: {
          ids: data.ids,
          key: 'nodeID',
        },
      });

      const formattedRes = result.reduce(
        (acc, val) => {
          return val.status === 'fulfilled'
            ? {
                ...acc,
                fulfilled: [...acc.fulfilled, val.value],
              }
            : {
                ...acc,
                rejected: [...acc.rejected, val.value],
              };
        },
        {
          fulfilled: [],
          rejected: [],
        }
      );
      response.status(statusCodes.OK).json(formattedRes);
    } catch (error) {
      next(error);
    }
  };
}

export default SharedController;
