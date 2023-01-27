import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { LochManager } from '../managers/LochManager';
import { initializeLochRoutes } from '../routes/LochRoutes';

class LochController {
  public _urlPath = '/loch';
  public _router = express.Router();
  public _lochManager: LochManager = container.get<LochManager>(LochManager);

  constructor() {
    initializeLochRoutes(this);
  }

  getAllServices = async (
    _: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._lochManager.getAllServices(
        response.locals.workspaceID,
        response.locals.idToken
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
      const result = await this._lochManager.getConnectedServices(
        response.locals.workspaceID,
        response.locals.idToken
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
      const result = await this._lochManager.connectToService(
        response.locals.workspaceID,
        response.locals.idToken,
        body
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
      const result = await this._lochManager.updateParentNoteOfConnected(
        response.locals.workspaceID,
        response.locals.idToken,
        body
      );

      response.status(statusCodes.NO_CONTENT).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default LochController;
