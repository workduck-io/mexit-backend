import express, { Request, Response } from 'express';
import container from '../inversify.config';
import { NodeManager } from '../managers/NodeManager';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';

class NodeController {
  public _urlPath = '/node';
  public _router = express.Router();
  public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.post(this._urlPath, this.createNode);
    this._router.post(`${this._urlPath}/:nodeId/append`, this.appendNode);
    this._router.post(
      `${this._urlPath}/:nodeId/blockUpdate`,
      this.editBlockInNode
    );
    this._router.delete(`${this._urlPath}/archive/:nodeId`, this.archivingNode);
    this._router.put(`${this._urlPath}/:nodeId`, this.deleteNode);
    this._router.get(
      `${this._urlPath}/archive/:nodeId`,
      this.getAllArchivedNodes
    );
    this._router.put(
      `${this._urlPath}/unarchive/:nodeId`,
      this.unArchivingNode
    );
    return;
  }

  createNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'NodeDetail');
      const result = await this._nodeManager.createNode(
        requestDetail.data,
        requestDetail.authToken
      );
      response.status(result.status).send(result.data);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  appendNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'Block');
      const result = await this._nodeManager.appendNode(
        request.params.nodeId,
        requestDetail.data,
        requestDetail.authToken
      );
      response.status(result.status).send(result.data);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  editBlockInNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'Block');
      const result = await this._nodeManager.editBlock(
        request.params.nodeId,
        requestDetail.data,
        requestDetail.authToken
      );
      response.status(result.status).send(result.data);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  archivingNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request);
      const result = await this._nodeManager.archivingNode(
        request.params.nodeId,
        requestDetail.authToken
      );
      response.status(result.status).send(result.data);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  deleteNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request);
      const result = await this._nodeManager.deleteNode(
        request.params.nodeId,
        requestDetail.authToken
      );
      response.status(result.status).send(result.data);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  getAllArchivedNodes = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request);
      const result = await this._nodeManager.getAllArchivedNodes(
        request.params.nodeId,
        requestDetail.authToken
      );
      response.status(result.status).send(result.data);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  unArchivingNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request);
      const result = await this._nodeManager.unArchivingNode(
        request.params.nodeId,
        requestDetail.authToken
      );
      response.status(result.status).send(result.data);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
}

export default NodeController;
