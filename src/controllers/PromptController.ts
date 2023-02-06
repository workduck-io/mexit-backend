import express, { NextFunction, Request, Response } from 'express';
import { STAGE } from '../env';
import { InvocationType } from '../libs/LambdaClass';
import { statusCodes } from '../libs/statusCodes';
import { initializePromptRoutes } from '../routes/PromptRoutes';

class PromptController {
  public _urlPath = '/prompt';
  public _router = express.Router();

  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _promptLambdaName = `gpt3Prompt-${STAGE}-main`;

  constructor() {
    initializePromptRoutes(this);
  }

  getAllPrompts = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._promptLambdaName,

        'getAllPrompts'
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUserAuthInfo = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._promptLambdaName,

        'getUserAuthInfo'
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateUserAuthInfo = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = request.body;
      const result = await response.locals.invoker(
        this._promptLambdaName,

        'updateUserAuthInfo',
        { payload: data }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllPromptProviders = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._promptLambdaName,

        'getAllPromptProviders'
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  generatePromptResult = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = request.body;
      const result = await response.locals.invoker(
        this._promptLambdaName,

        'generatePromptResult',
        { payload: data, pathParameters: { id: request.params.promptID } }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default PromptController;
