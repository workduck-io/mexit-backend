import express, { NextFunction, Request, Response } from 'express';

import { STAGE } from '../env';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeHighlightRoutes } from '../routes/HighlightsRoute';

class HighlightController {
  public _urlPath = '/highlight';
  public _router = express.Router();

  private _redisCache: Redis = container.get<Redis>(Redis);

  private _highlightServiceLambdaName = `highlights-${STAGE}-main`;

  constructor() {
    initializeHighlightRoutes(this);
  }

  createHighlight = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const data = new RequestClass(request).data;
      this._redisCache.del(data.entityId);
      const result = await response.locals.lambdaInvoker(this._highlightServiceLambdaName, 'createHighlight', {
        payload: data,
        sendRawBody: true,
      });

      response.status(statusCodes.OK).json(result);
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
        ? await response.locals.lambdaInvoker(this._highlightServiceLambdaName, 'getHighlightByIDs', {
            payload: { ids: nonCachedIds },
            sendRawBody: true,
          })
        : [];

      this._redisCache.mset(lambdaResponse.toObject('entityId', JSON.stringify));

      response.status(statusCodes.OK).json([...lambdaResponse, ...cachedHits]);
    } catch (error) {
      next(error);
    }
  };

  getAllHighlightsOfWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.lambdaInvoker(
        this._highlightServiceLambdaName,
        'getAllHighlightsOfWorkspace',
        { sendRawBody: true }
      );

      this._redisCache.mset(result.Items.toObject('entityId', JSON.stringify));

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteHighlight = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const entityId = request.params.entityId;
      await response.locals.lambdaInvoker(this._highlightServiceLambdaName, 'deleteHighlightByID', {
        pathParameters: { entityId: entityId },
        sendRawBody: true,
      });

      this._redisCache.del(entityId);

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

export default HighlightController;
