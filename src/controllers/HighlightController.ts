import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { HighlightManager } from '../managers/HighlightManager';
import { initializeHighlightRoutes } from '../routes/HighlightsRoute';

class HighlightController {
  public _urlPath = '/highlight';
  public _router = express.Router();

  public _highlightManager: HighlightManager =
    container.get<HighlightManager>(HighlightManager);

  private _redisCache: Redis = container.get<Redis>(Redis);

  constructor() {
    initializeHighlightRoutes(this);
  }

  createHighlight = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request);
      this._redisCache.del(requestDetail.data.entityId);
      const result = await this._highlightManager.createHighlight(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMultipleHighlights = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = new RequestClass(request).data;
      const cachedHits = (await this._redisCache.mget(data.ids))
        .filterEmpty()
        .map(hits => JSON.parse(hits));

      const nonCachedIds = data.ids.minus(cachedHits.map(item => item.id));

      const managerResponse = !nonCachedIds.isEmpty()
        ? await this._highlightManager.getMultipleHighlights(
            response.locals.workspaceID,
            response.locals.idToken,
            nonCachedIds
          )
        : [];

      this._redisCache.mset(managerResponse.toObject(val => val.entityId));

      response.status(statusCodes.OK).json([...managerResponse, ...cachedHits]);
    } catch (error) {
      next(error);
    }
  };

  getAllHighlightsOfWorkspace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._highlightManager.getAllHighlightsOfWorkspace(
        response.locals.workspaceID,
        response.locals.idToken
      );
      this._redisCache.mset(result.Items.toObject(val => val.entityId));

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteHighlight = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._highlightManager.deleteHighlight(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.entityId
      );
      this._redisCache.del(request.params.entityId);

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default HighlightController;
