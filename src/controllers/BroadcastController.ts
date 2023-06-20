import express, { NextFunction, Request, Response } from 'express';

import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeBroadcastRoutes } from '../routes/BroadcastRoutes';

class BroadcastController {
  public _urlPath = '/events';
  public _router = express.Router();

  constructor() {
    initializeBroadcastRoutes(this);
  }

  fetchEvents = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const data = new RequestClass(request, 'GetBroadcastMessageRequest').data;
      const result = await response.locals.invoker('GetBroadcastEvents', {
        payload: data,
        sendRawBody: true,
      });
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default BroadcastController;
