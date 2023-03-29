import express, { NextFunction, Request, Response } from 'express';

import { STAGE } from '../env';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeLinkRoutes } from '../routes/LinkRoutes';

class LinkController {
  public _urlPath = '/link';
  public _router = express.Router();

  private _linkServiceLambdaBase = `mex-url-shortner-${STAGE}`;

  constructor() {
    initializeLinkRoutes(this);
  }

  shortenLink = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const data = new RequestClass(request, 'ShortenLink').data;
      const result = await response.locals.lambdaInvoker(`${this._linkServiceLambdaBase}-shorten`, undefined, {
        httpMethod: 'POST',
        payload: data,
        sendRawBody: true,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllShortsOfWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.lambdaInvoker(`${this._linkServiceLambdaBase}-workspaceDetails`, undefined, {
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
      const result = await response.locals.lambdaInvoker(`${this._linkServiceLambdaBase}-del`, undefined, {
        httpMethod: 'DELETE',
        pathParameters: { url: request.params.url },
        sendRawBody: true,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getStatsByURL = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.lambdaInvoker(`${this._linkServiceLambdaBase}-stats`, undefined, {
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
