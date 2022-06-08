import express, { Request, Response, NextFunction } from 'express';

import container from '../inversify.config';
import { NodeManager } from '../managers/NodeManager';
import { statusCodes } from '../libs/statusCodes';
import { NodeResponse } from '../interfaces/Response';
import { initializePublicRoutes } from '../routes/PublicRoutes';

class PublicController {
  public _urlPath = '/public';
  public _router = express.Router();
  public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);

  constructor() {
    initializePublicRoutes(this);
  }

  getPublicNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const nodeId = request.params.nodeId;
      const idToken = request.headers.authorization;
      const result = (await this._nodeManager.getPublicNode(
        nodeId,
        idToken
      )) as NodeResponse;
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default PublicController;
