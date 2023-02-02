import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { PromptManager } from '../managers/PromptManager';
import { initializePromptRoutes } from '../routes/PromptRoutes';

class PromptController {
  public _urlPath = '/prompt';
  public _router = express.Router();

  public _promptManager: PromptManager =
    container.get<PromptManager>(PromptManager);

  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    initializePromptRoutes(this);
  }

  getAllPrompts = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._promptManager.getAllPrompts(
        response.locals.workspaceID,
        response.locals.idToken
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
      const result = await this._promptManager.getUserAuthInfo(response.locals);

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
      const result = await this._promptManager.updateUserAuthInfo(
        response.locals,
        data
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
      const result = await this._promptManager.getAllPromptProviders(
        response.locals
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
      const result = await this._promptManager.generatePromptResult(
        response.locals,
        request.params.promptID,
        data
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default PromptController;
