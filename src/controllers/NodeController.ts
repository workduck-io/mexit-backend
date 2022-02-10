import { MeiliSearch, Index } from 'meilisearch';
import express, { Request, Response } from 'express';
import container from '../inversify.config';
import { NodeManager } from '../managers/NodeManager';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { AuthRequest } from '../middlewares/authrequest';
import { Transformer } from '../libs/TransformerClass';
import { NodeResponse } from '../interfaces/Response';
import { serializeContent } from '../libs/serialize';

class NodeController {
  public _urlPath = '/node';
  public _router = express.Router();
  public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);
  private _client: MeiliSearch;

  constructor() {
    this.initializeRoutes();
    this._client = this._initMeilisearchIndex();
  }

  private _initMeilisearchIndex() {
    if (!process.env.MEILISEARCH_API_KEY)
      throw new Error('Meilisearch API Key Not Provided');

    const client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST ?? 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY,
    });

    return client;
  }

  public initializeRoutes(): void {
    this._router.post(this._urlPath, [AuthRequest], this.createNode);
    this._router.post(
      `${this._urlPath}/:nodeId/append`,
      [AuthRequest],
      this.appendNode
    );

    this._router.post(
      `${this._urlPath}/capture`,
      [AuthRequest],
      this.newCapture
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
    this._router.get(`${this._urlPath}/:nodeId`, [AuthRequest], this.getNode);
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

  newCapture = async (request: Request, response: Response): Promise<void> => {
    try {
      const reqBody = new RequestClass(request, 'ContentNodeRequest').data;
      const type = reqBody.type;

      // Adding to Activity Node
      const activityNodeUID = reqBody.id;

      const activityNodeDetail = {
        type: 'ElementRequest',
        elements: serializeContent(reqBody.content),
      };

      activityNodeDetail.elements.forEach(e => {
        e.createdBy = response.locals.userEmail;
      });

      console.log('Activity Node Detail: ', JSON.stringify(activityNodeDetail));

      const result = await this._nodeManager.appendNode(
        activityNodeUID,
        activityNodeDetail
      );

      // Add `appendNodeUID` check here to append instead of creating if node already exists
      if (type === 'HIERARCHY') {
        if (reqBody.createNodeUID) {
          const nodeDetail = {
            id: reqBody.createNodeUID,
            // nodePath: reqBody.nodePath,
            type: 'NodeRequest',
            lastEditedBy: response.locals.userEmail,
            namespaceIdentifier: 'NAMESPACE1',
            workspaceIdentifier: reqBody.workspaceIdentifier,
            data: serializeContent(reqBody.content),
            metadata: reqBody.metadata,
          };

          const nodeResult = await this._nodeManager.createNode(nodeDetail);
          response.json(JSON.parse(nodeResult));
        } else if (reqBody.appendNodeUID) {
          const appendDetail = {
            type: 'ElementRequest',
            elements: serializeContent(reqBody.content),
          };

          appendDetail.elements.forEach(e => {
            e.createdBy = response.locals.userEmail;
          });

          const result = await this._nodeManager.appendNode(
            reqBody.appendNodeUID,
            appendDetail
          );

          response.json(JSON.parse(result));
        }
      } else if (type === 'DRAFT') {
        response.json(JSON.parse(result));
      }
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  createNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const reqBody = new RequestClass(request, 'ClientNode').data;

      const nodeDetail = {
        id: reqBody.id,
        type: 'NodeRequest',
        lastEditedBy: response.locals.userEmail,
        namespaceIdentifier: 'NAMESPACE1',
        workspaceIdentifier: reqBody.workspaceIdentifier,
        data: serializeContent(reqBody.content),
      };

      // const nodeDetail = this._transformer.convertClientNodeToNodeFormat(
      //   requestDetail.data
      // );

      const nodeResult = await this._nodeManager.createNode(nodeDetail);

      // const result = this._transformer.convertNodeToClientNodeFormat(
      //   JSON.parse(nodeResult) as NodeResponse
      // );
      response.json(nodeResult);
      // .contentType('application/json')
      // .status(statusCodes.OK)
      // .send(nodeResult);
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
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(result);
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
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(result);
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
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(resultLinkNodeDetail);
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

      console.log('Node Detail: ', nodeDetail);

      const resultNodeDetail = await this._nodeManager.createNode(nodeDetail);
      const resultLinkNodeDetail = this._transformer.convertNodeToContentFormat(
        JSON.parse(resultNodeDetail) as NodeResponse
      );
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(resultLinkNodeDetail);
    } catch (error) {
      console.log('Error: ', error);
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  getAllNodes = async (request: Request, response: Response): Promise<void> => {
    try {
      const result = await this._nodeManager.getAllNodes(request.params.userId);
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(result);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  getNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const result = await this._nodeManager.getNode(request.params.nodeId);
      const nodeResponse = JSON.parse(result) as NodeResponse;
      const convertedResponse =
        this._transformer.genericNodeConverter(nodeResponse);
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(convertedResponse);
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
