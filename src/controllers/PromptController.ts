import express, { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../libs/statusCodes';
import { initializePromptRoutes } from '../routes/PromptRoutes';

class PromptController {
  public _urlPath = '/prompt';
  public _router = express.Router();

  constructor() {
    initializePromptRoutes(this);
  }

  getAllPrompts = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('getAllPrompts');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUserAuthInfo = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('getUserAuthInfo');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateUserAuthInfo = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const data = request.body;
      const result = await response.locals.invoker('updateUserAuthInfo', {
        payload: data,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllPromptProviders = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('getAllPromptProviders');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  generatePromptResult = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const data = request.body;
      const result = await response.locals.invoker('generatePromptResult', {
        payload: data,
        pathParameters: { id: request.params.promptID },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default PromptController;
