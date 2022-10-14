import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { LinkManager } from '../managers/LinkManager';
import { initializeLinkRoutes } from '../routes/LinkRoutes';

class LinkController {
  public _urlPath = '/link';
  public _router = express.Router();

  public _shortenerManager: LinkManager =
    container.get<LinkManager>(LinkManager);

  constructor() {
    initializeLinkRoutes(this);
  }

  getShortsByWorkspace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    const workspaceId = request.params.workspaceId;
    try {
      const result = await this._shortenerManager.getStatsByWorkspace(
        workspaceId
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default LinkController;
