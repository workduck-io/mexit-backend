import express, { NextFunction, Request, Response } from 'express';

import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeHighlightRoutes } from '../routes/HighlightsRoute';

class HighlightController {
  public _urlPath = '/highlight';
  public _router = express.Router();

  private _redisCache: Redis = container.get<Redis>(Redis);

  constructor() {
    initializeHighlightRoutes(this);
  }

  createHighlight = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const parentID = request.query.parentID;
      const requestPayload = new RequestClass(request, 'HighlightRequest').data;

      const highlightId = await response.locals.invoker('CreateHighlight', {
        payload: { ...requestPayload, type: 'EntityTypeRequest' },
        ...(parentID && { queryStringParameters: { parentID } }),
      });

      response.status(statusCodes.OK).json(highlightId);

      const highlight = { id: highlightId, ...requestPayload };
      await response.locals.broadcaster({
        operationType: 'CREATE',
        entityId: highlightId,
        entityType: 'HIGHLIGHT',
      });
      // set only if the body contains the data field
      // this case is for the instance duplication
      if (requestPayload.data) await this._redisCache.set(highlightId, highlight.data);
    } catch (error) {
      next(error);
    }
  };

  updateHighlight = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'HighlightRequest').data;
      const id = request.params.id;

      await response.locals.invoker('UpdateHighlight', {
        payload: { ...body, type: 'EntityTypeRequest' },
        pathParameters: { id: id },
      });

      await response.locals.broadcaster({
        operationType: 'UPDATE',
        entityId: id,
        entityType: 'HIGHLIGHT',
      });

      response.status(statusCodes.NO_CONTENT).send();

      await this._redisCache.del(id);
    } catch (error) {
      next(error);
    }
  };

  getHighlight = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = request.params.id;
      const queryParams = {
        namespaceID: request.query['namespaceID'] as string,
        nodeID: request.query['nodeID'] as string,
      };

      const highlightResult = await this._redisCache.getOrSet(
        {
          key: id,
        },
        () =>
          response.locals.invoker('GetHighlight', {
            pathParameters: { id: id },
            queryStringParameters: queryParams,
          })
      );

      response.status(statusCodes.OK).json(highlightResult);
    } catch (error) {
      next(error);
    }
  };

  getMultipleHighlights = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const data = new RequestClass(request).data;
      const cachedHits = (await this._redisCache.mget(data.ids)).filterEmpty().map(hits => JSON.parse(hits));

      const nonCachedIds = data.ids.minus(cachedHits.map(item => item.id));

      const lambdaResponse = !nonCachedIds.isEmpty()
        ? (
            await response.locals.invoker('GetHighlightsByIds', {
              payload: { ids: nonCachedIds },
            })
          ).items
        : [];

      response.status(statusCodes.OK).json([...lambdaResponse, ...cachedHits]);
      await this._redisCache.mset(lambdaResponse.toObject('id', JSON.stringify));
    } catch (error) {
      next(error);
    }
  };

  getAllHighlightsOfWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = {
        lastKey: request.query['lastKey'] as string,
      };

      const result = (
        await response.locals.invoker('GetAllHighlightsOfWorkspace', {
          queryStringParameters: { ...(queryParams && queryParams) },
        })
      ).items;

      response.status(statusCodes.OK).json(result);
      await this._redisCache.mset(result.toObject('id', JSON.stringify));
    } catch (error) {
      next(error);
    }
  };

  getAllHighlightInstances = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = request.params.id;
      const result = (
        await response.locals.invoker('GetAllHighlightInstances', {
          pathParameters: { id },
        })
      ).items;

      response.status(statusCodes.OK).json(result);
      await this._redisCache.mset(result.toObject('id', JSON.stringify));
    } catch (error) {
      next(error);
    }
  };

  deleteHighlight = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = request.params.id;
      const queryParams = {
        namespaceID: request.query['namespaceID'] as string,
        nodeID: request.query['nodeID'] as string,
      };

      await response.locals.invoker('DeleteHighlight', {
        pathParameters: { id },
        queryStringParameters: queryParams,
      });

      await response.locals.broadcaster({
        operationType: 'DELETE',
        entityId: id,
        entityType: 'HIGHLIGHT',
      });

      response.status(statusCodes.NO_CONTENT).send();
      await this._redisCache.del(id);
    } catch (error) {
      next(error);
    }
  };
}

export default HighlightController;
