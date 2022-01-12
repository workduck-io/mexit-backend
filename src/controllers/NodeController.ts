import express from 'express';
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

  createNode = (request, response) => {
    const requestDetail = new RequestClass(request, 'NodeDetail');
    // this._nodeManager.createNode(requestDetail.data);
    response.send(requestDetail);
  };
}

export default NodeController;
