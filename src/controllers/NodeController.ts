import express, { Request } from 'express';
import container from '../inversify.config';
import { NodeManager } from '../managers/NodeManager';
import { RequestClass } from '../libs/RequestClass';

class NodeController {
  public _urlPath = '/node';
  public _router = express.Router();
  public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this._router.post(this._urlPath, this.createNode);
  }

  createNode = async (request, response, next) => {
    try {
      const requestDetail = new RequestClass(request, 'NodeDetail');
      const result = await this._nodeManager.createNode(
        requestDetail.data,
        requestDetail.authToken
      );
      response.status(result.status).send(result.data);
    } catch (error) {
      next(error);
    }
  };

  appendNode = async (request, response, next) => {
    try {
      const requestDetail = new RequestClass(request, 'NodeDetail');
      const result = await this._nodeManager.appendNode(
        requestDetail.data.id,
        requestDetail.data,
        requestDetail.authToken
      );
      response.status(result.status).send(result.data);
    } catch (error) {
      next(error);
    }
  };
}

export default NodeController;
