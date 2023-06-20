import express, { NextFunction, Request, Response } from 'express';

import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeLinkRoutes } from '../routes/LinkRoutes';

class LinkController {
  public _urlPath = '/link';
  public _router = express.Router();

  constructor() {
    initializeLinkRoutes(this);
  }

  shortenLink = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const data = new RequestClass(request, 'ShortenLink').data;
      const result = await response.locals.invoker('shortenLink', {
        httpMethod: 'POST',
        payload: data,
        sendRawBody: true,
      });
      await response.locals.broadcaster({
        operationType: 'CREATE',
        entityType: 'LINK',
        entityId: data.url,
      });
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllShortsOfWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('getAllShortsOfWorkspace', {
        httpMethod: 'GET',
        sendRawBody: true,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteShort = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('deleteShort', {
        httpMethod: 'DELETE',
        pathParameters: { url: request.params.url },
        sendRawBody: true,
      });
      await response.locals.broadcaster({
        operationType: 'CREATE',
        entityType: 'LINK',
        entityId: request.params.url,
      });
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getStatsByURL = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('getStatsByURL', {
        httpMethod: 'GET',
        pathParameters: { url: request.params.url },
        sendRawBody: true,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default LinkController;
