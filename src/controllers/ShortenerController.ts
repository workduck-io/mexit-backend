import express, { Request, Response } from 'express';
import container from '../inversify.config';

import { AuthRequest } from '../middlewares/authrequest';
import { statusCodes } from '../libs/statusCodes';
import { ShortenerManager } from '../managers/ShortenerManager';

class ShortenerController {
  public _urlPath = '/shortener';
  public _router = express.Router();

  public _shortenerManager: ShortenerManager =
    container.get<ShortenerManager>(ShortenerManager);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.get(
      `${this._urlPath}/:workspaceId`,
      [AuthRequest],
      this.getShortsByWorkspace
    );
  }

  getShortsByWorkspace = async (
    request: Request,
    response: Response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    const workspaceId = request.params.workspaceId;
    try {
      const result = await this._shortenerManager.getStatsByWorkspace(
        workspaceId
      );
      response.send(result);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };
}

export default ShortenerController;
