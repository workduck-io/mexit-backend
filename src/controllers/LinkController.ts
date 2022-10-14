import express, { NextFunction, Request, Response } from 'express';
import { RequestClass } from '../libs/RequestClass';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { LinkManager } from '../managers/LinkManager';
import { initializeLinkRoutes } from '../routes/LinkRoutes';

class LinkController {
  public _urlPath = '/link';
  public _router = express.Router();

  public _linkManager: LinkManager = container.get<LinkManager>(LinkManager);

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
      const result = await this._linkManager.createNewShort(
        response.locals.workspaceID,
        response.locals.idToken,
        data
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
      const result = await this._linkManager.getAllShortsOfWorkspace(
        response.locals.workspaceID,
        response.locals.idToken
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
      const result = await this._linkManager.deleteShort(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.url
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
      const result = await this._linkManager.getStatsByURL(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.url
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default LinkController;
