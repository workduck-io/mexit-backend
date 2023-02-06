import express, { NextFunction, Request, Response } from 'express';
import { RequestClass } from '../libs/RequestClass';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { initializeLinkRoutes } from '../routes/LinkRoutes';
import { STAGE } from '../env';
import { InvocationType } from '../libs/LambdaClass';

class LinkController {
  public _urlPath = '/link';
  public _router = express.Router();

  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _linkServiceLambdaBase = `mex-url-shortner-${STAGE}`;

  constructor() {
    initializeLinkRoutes(this);
  }

  shortenLink = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = new RequestClass(request, 'ShortenLink').data;
      const result = await response.locals.invoker(
        `${this._linkServiceLambdaBase}-shorten`,

        undefined,
        {
          payload: data,
        }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllShortsOfWorkspace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        `${this._linkServiceLambdaBase}-workspaceDetails`,

        undefined
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteShort = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        `${this._linkServiceLambdaBase}-del`,

        undefined,
        {
          pathParameters: { url: request.params.url },
        }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getStatsByURL = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        `${this._linkServiceLambdaBase}-stats`,

        undefined,
        {
          pathParameters: { url: request.params.url },
        }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default LinkController;
