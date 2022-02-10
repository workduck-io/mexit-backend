import { MeiliSearch, Index } from 'meilisearch';
import express, { Request, Response } from 'express';
import crypto from 'crypto';

import container from '../inversify.config';
import { NodeManager } from '../managers/NodeManager';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { AuthRequest } from '../middlewares/authrequest';
import { Transformer } from '../libs/TransformerClass';
import { NodeResponse } from '../interfaces/Response';
import { serializeContent } from '../libs/serialize';
import { Document } from '../interfaces/Search';

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

  private _newMeilisearchIndex = async (
    client: MeiliSearch,
    userID: string
  ) => {
    const task = await client.createIndex(userID);
    const resp = await client.waitForTask(task.uid);

    if (resp.error) {
      throw new Error(resp.error.message);
    }

    return resp;
  };

  private _addOrReplaceIndex = async (
    userEmail: string,
    document: Document
  ) => {
    const userHash = crypto.createHash('md5').update(userEmail).digest('hex');
    let index: Index;
    try {
      index = await this._client.getIndex(userHash);
    } catch (err) {
      try {
        await this._newMeilisearchIndex(this._client, userHash);
        index = await this._client.getIndex(userHash);
      } catch (error) {
        return err;
      }
    }

    const task = await index.addDocuments([document]);
    // const status = await this._client.waitForTask(task.uid);

    // if (status.error) {
    //   return status.error.message;
    // }

    return;
  };

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

          try {
            await this._addOrReplaceIndex(response.locals.userEmail, {
              id: reqBody.createNodeUID,
              nodePath: reqBody.nodePath,
            });
          } catch (err) {
            console.error('Error while indexing: ', err);
          }

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
      const requestDetail = new RequestClass(request, 'ClientNode');

      const nodeDetail = {
        id: requestDetail.data.id,
        type: 'NodeRequest',
        lastEditedBy: response.locals.userEmail,
        namespaceIdentifier: 'NAMESPACE1',
        workspaceIdentifier: requestDetail.data.workspaceIdentifier,
        data: serializeContent(requestDetail.data.content),
      };

      try {
        await this._addOrReplaceIndex(response.locals.userEmail, {
          id: requestDetail.data.id,
          nodePath: requestDetail.data.nodePath,
        });
      } catch (err) {
        console.error('Error while indexing: ', err);
      }

      const nodeResult = await this._nodeManager.createNode(nodeDetail);

      response.json(nodeResult);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  appendNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ContentNodeRequest');
      const appendDetail = {
        type: 'ElementRequest',
        elements: serializeContent(requestDetail.data.content),
      };

      appendDetail.elements.forEach(e => {
        e.createdBy = response.locals.userEmail;
      });

      const result = await this._nodeManager.appendNode(
        requestDetail.data.appendNodeUID,
        appendDetail
      );

      response.json(JSON.parse(result));
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
