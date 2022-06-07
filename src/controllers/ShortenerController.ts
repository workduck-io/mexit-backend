import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { ShortenerManager } from '../managers/ShortenerManager';
import { initializeShortenerRoutes } from '../routes/ShortenerRoutes';

class ShortenerController {
  public _urlPath = '/shortener';
  public _router = express.Router();

  public _shortenerManager: ShortenerManager =
    container.get<ShortenerManager>(ShortenerManager);

  constructor() {
    initializeShortenerRoutes(this);
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

export default ShortenerController;
