import express, { NextFunction, Request, Response } from 'express';

import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeLochRoutes } from '../routes/LochRoutes';

class LochController {
  public _urlPath = '/loch';
  public _router = express.Router();

  constructor() {
    initializeLochRoutes(this);
  }

  getAllServices = async (_: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('getAllServices');

      response.status(statusCodes.OK).jsonp(result);
    } catch (error) {
      next(error);
    }
  };

  getConnectedServives = async (_: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('getConnectedServices');

      response.status(statusCodes.OK).jsonp(result);
    } catch (error) {
      next(error);
    }
  };

  connectToService = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'ConnectToLochService').data;
      const result = await response.locals.invoker('connectToService', {
        payload: body,
      });

      response.status(statusCodes.NO_CONTENT).jsonp(result);
    } catch (error) {
      next(error);
    }
  };

  updateParentNodeOfConnectedService = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = new RequestClass(request, 'UpdateParentNodeForLochService').data;
      const result = await response.locals.invoker('updateParentNodeOfService', {
        payload: body,
      });
      response.status(statusCodes.NO_CONTENT).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default LochController;
