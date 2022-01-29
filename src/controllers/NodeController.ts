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
    this._router.delete(
      `${this._urlPath}/archive/:nodeId`,
      [AuthRequest],
      this.archivingNode
    );
    this._router.put(
      `${this._urlPath}/:nodeId`,
      [AuthRequest],
      this.deleteNode
    );
    this._router.get(
      `${this._urlPath}/archive/:nodeId`,
      [AuthRequest],

      this.getAllArchivedNodes
    );
    this._router.put(
      `${this._urlPath}/unarchive/:nodeId`,
      [AuthRequest],
      this.unArchivingNode
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
      const result = await this._nodeManager.getAllArchivedNodes(
        request.params.nodeId,
        request.headers.authorization.toString()
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

  createLinkNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'LinkNodeRequest');
      const nodeDetail = this._transformer.convertLinkToNodeFormat(
        requestDetail.data
      );
      const resultNodeDetail = await this._nodeManager.createNode(
        nodeDetail,
        requestDetail.authToken
      );
      const resultLinkNodeDetail = this._transformer.convertNodeToLinkFormat(
        resultNodeDetail.data as NodeResponse
      );
      response.status(resultNodeDetail.status).send(resultLinkNodeDetail);
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
      const resultNodeDetail = await this._nodeManager.createNode(
        nodeDetail,
        requestDetail.authToken
      );
      const resultLinkNodeDetail = this._transformer.convertNodeToContentFormat(
        resultNodeDetail.data as NodeResponse
      );
      response.status(resultNodeDetail.status).send(resultLinkNodeDetail);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  getAllNodes = async (request: Request, response: Response): Promise<void> => {
    try {
      const result = await this._nodeManager.getAllNodes(
        request.params.userId,
        request.headers.authorization.toString()
      );
      response.status(result.status).send(result.data);
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
