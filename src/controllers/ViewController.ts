import express, { NextFunction, Request, Response } from 'express';
import { STAGE } from '../env';
import { InvocationType } from '../libs/LambdaClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeViewRoutes } from '../routes/ViewRoutes';

class ViewController {
  public _urlPath = '/view';
  public _router = express.Router();

  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _taskViewLambdaName = `task-${STAGE}-view`;
  private _additionalHeaders: { 'mex-api-ver': 'v2' };

  constructor() {
    initializeViewRoutes(this);
  }

  getView = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._taskViewLambdaName,
        this._lambdaInvocationType,
        'getView',
        {
          pathParameters: { entityId: request.params.viewID },
          additionalHeaders: this._additionalHeaders,
        }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllViews = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._taskViewLambdaName,
        this._lambdaInvocationType,
        'getAllViews',
        { additionalHeaders: this._additionalHeaders }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteView = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await response.locals.invoker(
        this._taskViewLambdaName,
        this._lambdaInvocationType,
        'deleteView',
        {
          pathParameters: { entityId: request.params.viewID },
          additionalHeaders: this._additionalHeaders,
        }
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  postView = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = new RequestClass(request, 'PostView').data;

      const result = await response.locals.invoker(
        this._taskViewLambdaName,
        this._lambdaInvocationType,
        'saveView',
        { additionalHeaders: this._additionalHeaders, payload: data }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default ViewController;
