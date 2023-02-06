import express, { NextFunction, Request, Response } from 'express';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeLochRoutes } from '../routes/LochRoutes';
import { InvocationType } from '../libs/LambdaInvoker';
import { STAGE } from '../env';

class LochController {
  public _urlPath = '/loch';
  public _router = express.Router();

  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _mexLochLambdaBase = `mex-loch-${STAGE}`;

  constructor() {
    initializeLochRoutes(this);
  }

  getAllServices = async (
    _: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        `${this._mexLochLambdaBase}-allConfig`,
        'getAllServices'
      );

      response.status(statusCodes.OK).jsonp(result);
    } catch (error) {
      next(error);
    }
  };

  getConnectedServives = async (
    _: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        `${this._mexLochLambdaBase}-connected`,
        'getConnectedServices'
      );

      response.status(statusCodes.OK).jsonp(result);
    } catch (error) {
      next(error);
    }
  };

  connectToService = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = new RequestClass(request, 'ConnectToLochService').data;
      const result = await response.locals.invoker(
        `${this._mexLochLambdaBase}-register`,
        'connectToService',
        {
          payload: body,
        }
      );

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
      const body = new RequestClass(request, 'UpdateParentNodeForLochService')
        .data;
      const result = await response.locals.invoker(
        `${this._mexLochLambdaBase}-update`,
        'updateParentNodeOfService',
        { payload: body }
      );
      response.status(statusCodes.NO_CONTENT).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default LochController;
