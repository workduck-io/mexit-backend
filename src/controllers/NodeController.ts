import express, { Request, Response } from 'express';
import container from '../inversify.config';
import { NodeManager } from '../managers/NodeManager';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { AuthRequest } from '../middlewares/authrequest';
import { Transformer } from '../libs/TransformerClass';
import { NodeResponse } from '../interfaces/Response';

class NodeController {
  public _urlPath = '/node';
  public _router = express.Router();
  public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.post(this._urlPath, [AuthRequest], this.createNode);
    this._router.post(
      `${this._urlPath}/:nodeId/append`,
      [AuthRequest],
      this.appendNode
    );
    this._router.post(
      `${this._urlPath}/:nodeId/blockUpdate`,
      [AuthRequest],
      this.editBlockInNode
    );
    this._router.post(
      `${this._urlPath}/link`,
      [AuthRequest],
      this.createLinkNode
    );
    this._router.post(
      `${this._urlPath}/content`,
      [AuthRequest],
      this.createContentNode
    );
    this._router.get(
      `${this._urlPath}/all/:userId`,
      [AuthRequest],
      this.getAllNodes
    );
    this._router.get(
      `${this._urlPath}/clearcache`,
      [AuthRequest],
      this.clearCache
    );
    return;
  }

  createNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'NodeDetail');
      const result = await this._nodeManager.createNode(requestDetail.data);
      response.status(statusCodes.OK).send(JSON.parse(result));
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  appendNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'Block');
      const result = await this._nodeManager.appendNode(
        request.params.nodeId,
        requestDetail.data
      );
      response.status(statusCodes.OK).send(result);
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
        requestDetail.data
      );
      response.status(statusCodes.OK).send(result);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  createLinkNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'LinkNodeRequest');
      const nodeDetail = this._transformer.convertLinkToNodeFormat(
        requestDetail.data
      );
      const resultNodeDetail = await this._nodeManager.createNode(nodeDetail);
      const resultLinkNodeDetail = this._transformer.convertNodeToLinkFormat(
        JSON.parse(resultNodeDetail) as NodeResponse
      );
      response.status(statusCodes.OK).send(resultLinkNodeDetail);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  createContentNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ContentNodeRequest');
      const nodeDetail = this._transformer.convertContentToNodeFormat(
        requestDetail.data
      );
      const resultNodeDetail = await this._nodeManager.createNode(nodeDetail);
      const resultLinkNodeDetail = this._transformer.convertNodeToContentFormat(
        JSON.parse(resultNodeDetail) as NodeResponse
      );
      response.status(statusCodes.OK).send(resultLinkNodeDetail);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  getAllNodes = async (request: Request, response: Response): Promise<void> => {
    try {
      const result = await this._nodeManager.getAllNodes(request.params.userId);
      response.status(statusCodes.OK).send(result);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  //TODO: ClearCache not working have to fix this
  clearCache = (response: Response): void => {
    try {
      this._nodeManager.clearCache();
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
}

export default NodeController;
