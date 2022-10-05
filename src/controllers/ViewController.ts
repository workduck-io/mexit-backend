import express, { NextFunction, Request, Response } from 'express';
import { initializeViewRoutes } from '../routes/ViewRoutes';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { ViewManager } from '../managers/ViewManager';

class ViewController {
  public _urlPath = '/view';
  public _router = express.Router();
  public _viewManager: ViewManager = container.get<ViewManager>(ViewManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    initializeViewRoutes(this);
  }

  getView = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._viewManager.getView(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.viewID
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
      const result = await this._viewManager.getAllViews(
        response.locals.workspaceID,
        response.locals.idToken
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
      const result = await this._viewManager.deleteView(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.viewID
      );

      response.status(statusCodes.OK).json(result);
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
      const result = await this._viewManager.saveView(
        response.locals.workspaceID,
        response.locals.idToken,
        request.body
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default ViewController;
