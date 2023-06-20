import express, { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../libs/statusCodes';
import { initializeViewRoutes } from '../routes/ViewRoutes';

class ViewController {
  public _urlPath = '/view';
  public _router = express.Router();

  private _additionalHeaders: { 'mex-api-ver': 'v2' };

  constructor() {
    initializeViewRoutes(this);
  }

  getView = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('getView', {
        pathParameters: { entityId: request.params.viewID },
        additionalHeaders: this._additionalHeaders,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllViews = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('getAllViews', {
        additionalHeaders: this._additionalHeaders,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteView = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await response.locals.invoker('deleteView', {
        pathParameters: { entityId: request.params.viewID },
        additionalHeaders: this._additionalHeaders,
      });
      await response.locals.broadcaster({
        operationType: 'DELETE',
        entityType: 'VIEW',
        entityId: request.params.viewID,
      });
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  postView = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('saveView', {
        additionalHeaders: this._additionalHeaders,
        payload: request.body,
        sendRawBody: true,
      });
      await response.locals.broadcaster({
        operationType: 'UPDATE',
        entityType: 'VIEW',
        entityId: request.params.viewID,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default ViewController;
