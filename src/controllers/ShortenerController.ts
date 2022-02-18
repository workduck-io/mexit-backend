import express, { Request, Response } from 'express';
import container from '../inversify.config';

import { AuthRequest } from '../middlewares/authrequest';
import { statusCodes } from '../libs/statusCodes';
import { ShortenerManager } from '../managers/ShortenerManager';
import { LinkNode } from '../interfaces/Node';

class ShortenerController {
  public _urlPath = '/shortener';
  public _router = express.Router();

  public _shortenerManager: ShortenerManager =
    container.get<ShortenerManager>(ShortenerManager);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.post(this._urlPath, [AuthRequest], this.createNewShort);
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
      const result = await this._shortenerManager.getShortsByWorkspace(
        workspaceId
      );
      response.send(result);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  createNewShort = async (
    request: Request,
    response: Response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    const body: LinkNode = request.body;
    try {
      const result = await this._shortenerManager.createNewShort(body);
      response.send(result);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
}

export default ShortenerController;
