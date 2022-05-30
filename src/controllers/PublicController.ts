import express, { Request, Response } from 'express';

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
    response: Response
  ): Promise<void> => {
    try {
      const nodeId = request.params.nodeId;
      const result = await this._nodeManager.getPublicNode(nodeId);

      if (JSON.parse(result).message) {
        throw new Error(JSON.parse(result).message);
      }

      const nodeResponse = JSON.parse(result) as NodeResponse;
      response.status(statusCodes.OK).json(nodeResponse);
    } catch (error) {
      const resp = {
        message: error.message,
      };
      response.status(statusCodes.INTERNAL_SERVER_ERROR).json(resp);
    }
  };
}

export default PublicController;
