import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { ActionManager } from '../managers/ActionManager';
import { initializeActionRoutes } from '../routes/ActionRoutes';

class ActionController {
  public _urlPath = '/actiongroup';
  public _router = express.Router();

  public _actionManager: ActionManager =
    container.get<ActionManager>(ActionManager);

  constructor() {
    initializeActionRoutes(this);
  }

  getAction = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._actionManager.getAction(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.groupId,
        request.params.actionId
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllActions = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._actionManager.getAllActions(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.groupId
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllAuth = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._actionManager.getAllAuths(
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAuth = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._actionManager.getAuth(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.authId
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  refreshAuth = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._actionManager.refreshAuth(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.source
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateAuth = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = new RequestClass(request).data;

      const result = await this._actionManager.updateAuth(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.authId,
        data
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default ActionController;
