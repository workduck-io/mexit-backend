import express, { NextFunction, Request, Response } from 'express';

import { STAGE } from '../env';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeSmartCaptureRoutes } from '../routes/SmartCaptureRoutes';

class SmartCaptureController {
  public _urlPath = '/capture';
  public _router = express.Router();

  private _cache = container.get<Redis>(Redis);
  private _PublicCaptureLabel = 'PUBLICCAPTURE';
  private _smartCaptureLambdaName = `smartcapture-${STAGE}-config`;

  constructor() {
    initializeSmartCaptureRoutes(this);
  }

  getAllPublicConfigs = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._cache.getOrSet(
        {
          key: this._PublicCaptureLabel,
          expires: 24 * 60 * 60 * 60, // 24 hours
        },
        () => response.locals.invoker('getPublicCaptureConfig')
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createCapture = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'SmartCaptureRequest').data;

      const captureResult = await response.locals.invoker('createSmartCapture', {
        payload: { ...body, type: 'EntityTypeRequest' },
      });
      response.status(statusCodes.OK).json(captureResult);
      const capture = { id: captureResult, ...body };
      await response.locals.broadcaster({
        operationType: 'CREATE',
        entityType: 'CAPTURE',
        entityId: captureResult,
      });
      await this._cache.set(captureResult, capture);
    } catch (error) {
      next(error);
    }
  };

  updateCapture = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'SmartCaptureRequest').data;
      const id = request.params.id;

      await response.locals.invoker('createSmartCapture', {
        payload: { ...body, type: 'EntityTypeRequest' },
        pathParameters: { id: id },
      });
      await response.locals.broadcaster({
        operationType: 'UPDATE',
        entityType: 'CAPTURE',
        entityId: id,
      });

      response.status(statusCodes.NO_CONTENT).send();

      await this._cache.del(id);
    } catch (error) {
      next(error);
    }
  };

  getCapture = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = request.params.id;
      const queryParams = {
        namespaceID: request.query['namespaceID'] as string,
        nodeID: request.query['nodeID'] as string,
      };

      const captureResult = await this._cache.getOrSet(
        {
          key: id,
        },
        () =>
          response.locals.invoker('getCapture', {
            pathParameters: { id: id },
            queryStringParameters: queryParams,
          })
      );

      response.status(statusCodes.OK).json(captureResult);
    } catch (error) {
      next(error);
    }
  };

  deleteCapture = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = request.params.id;

      await response.locals.invoker('deleteCapture', { pathParameters: { id: id } });
      await response.locals.broadcaster({
        operationType: 'DELETE',
        entityType: 'CAPTURE',
        entityId: id,
      });

      response.status(statusCodes.NO_CONTENT).send();

      await this._cache.del(id);
    } catch (error) {
      next(error);
    }
  };

  filterAllCaptures = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const { configID, isWorkspaceID, isUserID } = request.query;

      const queryParam = Object.fromEntries(
        Object.entries({ configID, isWorkspaceID, isUserID })
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, value])
      );

      if (Object.keys(queryParam).length !== 1) {
        response
          .status(statusCodes.BAD_REQUEST)
          .json({ error: 'Provide only one of configID, isWorkspaceID and isUserID as query parameter' });
      }

      const result = await response.locals.invoker('filterAllCaptures', { queryStringParameters: queryParam });
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default SmartCaptureController;
