import express, { Request, Response } from 'express';
import container from '../inversify.config';
import { NodeManager } from '../managers/NodeManager';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { ShortenerManager } from '../managers/ShortenerManager';
import { NodeResponse } from '../interfaces/Response';
import { Cache } from '../libs/CacheClass';
import GuidGenerator from '../libs/GuidGenerator';
import { initializeNodeRoutes } from '../routes/NodeRoutes';

class NodeController {
  public _urlPath = '/node';
  public _router = express.Router();
  public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);
  public _shortenerManager: ShortenerManager =
    container.get<ShortenerManager>(ShortenerManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);
  private _cache: Cache = container.get<Cache>(Cache);
  private _linkHierarchyLabel = 'LINKHIERARCHY';

  constructor() {
    initializeNodeRoutes(this);
  }

  async updateILinkCache(
    userId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const result = await this._nodeManager.getLinkHierarchy(
      workspaceId,
      idToken
    );
    this._cache.replaceAndSet(userId, this._linkHierarchyLabel, result);
    return this._cache.get(userId, this._linkHierarchyLabel);
  }

  createLinkCapture = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const reqBody = new RequestClass(request, 'LinkCapture').data;

      const shortenerResp = await this._shortenerManager.createNewShort(
        reqBody
      );
      const shortenedURL = JSON.parse(shortenerResp).message;

      if (shortenedURL === 'URL already exists') {
        response.status(statusCodes.BAD_REQUEST).json({
          message: 'Alias Already Exists',
        });
        return;
      }

      const nodeDetail = {
        id: GuidGenerator.generateNodeGUID(),
        type: 'NodeRequest',
        title: reqBody.short,
        lastEditedBy: response.locals.userEmail,
        namespaceIdentifier: 'NAMESPACE1',
        data: [
          {
            id: GuidGenerator.generateBlockGUID(),
            elementType: 'h1',
            createdBy: response.locals.userEmail,
            children: [
              { id: GuidGenerator.generateTempGUID(), content: shortenedURL },
            ],
          },
          {
            id: GuidGenerator.generateBlockGUID(),
            elementType: 'p',
            createdBy: response.locals.userEmail,
            children: [
              {
                id: GuidGenerator.generateTempGUID(),
                content: '',
              },
              {
                id: GuidGenerator.generateTempGUID(),
                elementType: 'a',
                properties: {
                  url: reqBody.long,
                },
                children: [
                  {
                    id: GuidGenerator.generateTempGUID(),
                    content: reqBody.long,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = await this._nodeManager.createNode(
        response.locals.workspaceID,
        response.locals.idToken,
        nodeDetail
      );

      const resp = JSON.parse(result);

      if (resp.message) throw new Error(resp.message);

      resp.shortenedURL = shortenedURL;
      response.json(resp);

      // update the Link hierarchy cache
      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  createNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ContentNodeRequest');

      if (requestDetail.data.id === `NODE_${response.locals.userId}`)
        throw new Error('Cannot create a node using activitynode id.');

      const nodeResult = await this._nodeManager.createNode(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );

      response.status(statusCodes.OK).json(JSON.parse(nodeResult));

      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  getAllNodes = async (request: Request, response: Response): Promise<void> => {
    try {
      const result = await this._nodeManager.getAllNodes(
        request.params.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(result);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  getNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const result = await this._nodeManager.getNode(
        request.params.nodeId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      if (JSON.parse(result).message)
        throw new Error(JSON.parse(result).message);

      const nodeResponse = JSON.parse(result) as NodeResponse;
      // const convertedResponse =
      //   this._transformer.genericNodeConverter(nodeResponse);
      const convertedResponse = nodeResponse;
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(convertedResponse);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  copyOrMoveBlock = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'CopyOrMoveBlockRequest');

      const result = await this._nodeManager.moveBlocks(
        requestDetail.data.blockId,
        requestDetail.data.sourceNodeId,
        requestDetail.data.destinationNodeId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      if (result) {
        throw new Error(result);
      }
      response.contentType('application/json').status(statusCodes.NO_CONTENT);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  makeNodePublic = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const nodeId = request.params.id;

      const result = await this._nodeManager.makeNodePublic(
        nodeId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).json(JSON.parse(result.body));
    } catch (error) {
      console.error(error);
      response.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  };

  makeNodePrivate = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const nodeId = request.params.id;

      const result = await this._nodeManager.makeNodePrivate(
        nodeId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).json(JSON.parse(result.body));
    } catch (error) {
      console.error(error);
      response.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  };

  getLinkHierarchy = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      let linkDataResult: any[];

      if (this._cache.has(response.locals.userId, this._linkHierarchyLabel)) {
        linkDataResult = await this._cache.get(
          response.locals.userId,
          this._linkHierarchyLabel
        );
      } else {
        const linkHierarchyResult = await this._nodeManager.getLinkHierarchy(
          response.locals.workspaceID,
          response.locals.idToken
        );

        if (linkHierarchyResult?.message)
          throw new Error(linkHierarchyResult.message);
        else {
          this._cache.set(
            response.locals.userId,
            this._linkHierarchyLabel,
            linkHierarchyResult
          );
          linkDataResult = linkHierarchyResult;
        }
      }
      const result = this._transformer.linkHierarchyParser(linkDataResult);
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(result);
    } catch (error) {
      console.error(error);
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ errorMsg: error.message })
        .json();
    }
  };

  archiveNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ArchiveNodeDetail');

      const archiveNodeResult = await this._nodeManager.archiveNode(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );

      // update the Link hierarchy cache
      response.json(archiveNodeResult);
      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  unArchiveNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ArchiveNodeDetail');

      const archiveNodeResult = await this._nodeManager.unArchiveNode(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );

      // update the Link hierarchy cache
      response.json(archiveNodeResult);
      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  refactorHierarchy = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'RefactorRequest');

      const refactorResp = JSON.parse(
        (
          await this._nodeManager.refactorHierarchy(
            response.locals.workspaceID,
            response.locals.idToken,
            requestDetail.data
          )
        ).body
      );

      const { addedPaths, removedPaths } = refactorResp;
      const addedILinks = this._transformer.linkHierarchyParser(addedPaths);
      const removedILinks = this._transformer.linkHierarchyParser(removedPaths);

      response.status(statusCodes.OK).json({ addedILinks, removedILinks });
      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.toString() });
    }
  };

  bulkCreateNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'BulkCreateNode');

      const bulkCreateResp = JSON.parse(
        (
          await this._nodeManager.bulkCreateNode(
            response.locals.workspaceID,
            response.locals.idToken,
            requestDetail.data
          )
        ).body
      );

      const { addedPaths, removedPaths, node } = bulkCreateResp;
      const addedILinks = this._transformer.linkHierarchyParser(addedPaths);
      const removedILinks = this._transformer.linkHierarchyParser(removedPaths);

      const createdNode = JSON.parse(node) as NodeResponse;

      response
        .status(statusCodes.OK)
        .json({ addedILinks, removedILinks, node: createdNode });

      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.toString() });
    }
  };

  getArchivedNodes = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const getArchiveResp = await this._nodeManager.getArchivedNodes(
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).json(JSON.parse(getArchiveResp.body));
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.toString() });
    }
  };
}

export default NodeController;
