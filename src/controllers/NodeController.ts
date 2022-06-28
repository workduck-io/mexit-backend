import express, { Request, Response, NextFunction } from 'express';
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

  getLinkHierarchy = async (
    request: Request,
    response: Response,
    next: NextFunction
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

        this._cache.set(
          response.locals.userId,
          this._linkHierarchyLabel,
          linkHierarchyResult
        );
        linkDataResult = linkHierarchyResult;
      }
      const result = this._transformer.linkHierarchyParser(linkDataResult);
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ContentNodeRequest');
      const nodeResult = await this._nodeManager.createNode(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );

      response.status(statusCodes.OK).json(nodeResult);

      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      next(error);
    }
  };

  getNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = (await this._nodeManager.getNode(
        request.params.nodeId,
        response.locals.workspaceID,
        response.locals.idToken
      )) as NodeResponse;

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllNodes = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._nodeManager.getAllNodes(
        request.params.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  appendNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const blockDetail = new RequestClass(request, 'AppendBlockRequest').data;
      const result = await this._nodeManager.appendNode(
        request.params.nodeId,
        response.locals.workspaceID,
        response.locals.idToken,
        blockDetail
      );

      response.status(statusCodes.OK).json(result);

      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      next(error);
    }
  };

  createLinkCapture = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const reqBody = new RequestClass(request, 'LinkCapture').data;

      const shortenedURL = (
        await this._shortenerManager.createNewShort(reqBody)
      ).message;

      if (shortenedURL === 'URL already exists') {
        response.status(statusCodes.BAD_REQUEST).json({
          message: 'Alias Already Exists',
        });
        return;
      }

      response.status(statusCodes.OK).json({ message: shortenedURL });

      const nodeDetail = {
        nodePath: {
          path: `Links#${reqBody.short}`,
        },
        id: GuidGenerator.generateNodeGUID(),
        title: reqBody.short,
        data: [
          {
            id: GuidGenerator.generateBlockGUID(),
            elementType: 'h1',
            children: [
              { id: GuidGenerator.generateTempGUID(), content: reqBody.short },
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
                  url: shortenedURL,
                },
                children: [
                  {
                    id: GuidGenerator.generateTempGUID(),
                    content: shortenedURL,
                  },
                ],
              },
            ],
          },
        ],
      };

      await this._nodeManager.bulkCreateNode(
        response.locals.workspaceID,
        response.locals.idToken,
        nodeDetail
      );

      // update the Link hierarchy cache
      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      next(error);
    }
  };

  copyOrMoveBlock = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'CopyOrMoveBlockRequest');

      await this._nodeManager.moveBlocks(
        requestDetail.data.blockId,
        requestDetail.data.sourceNodeId,
        requestDetail.data.destinationNodeId,
        response.locals.workspaceID,
        response.locals.idToken
      );
      response.status(statusCodes.NO_CONTENT).json();
    } catch (error) {
      next(error);
    }
  };

  makeNodePublic = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const nodeId = request.params.id;

      const result = await this._nodeManager.makeNodePublic(
        nodeId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  makeNodePrivate = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const nodeId = request.params.id;

      const result = await this._nodeManager.makeNodePrivate(
        nodeId,
        response.locals.workspaceID,
        response.locals.idToken
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  archiveNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ArchiveNodeDetail');

      const archiveNodeResult = await this._nodeManager.archiveNode(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );
      response.status(statusCodes.OK).json(archiveNodeResult);

      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      next(error);
    }
  };

  deleteArchivedNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ArchiveNodeDetail');

      const archiveNodeResult = await this._nodeManager.deletedArchivedNode(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );
      response.status(statusCodes.OK).json(archiveNodeResult);

      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      next(error);
    }
  };

  unArchiveNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ArchiveNodeDetail');

      const archiveNodeResult = await this._nodeManager.unArchiveNode(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );
      response.status(statusCodes.OK).json(archiveNodeResult);

      await this.updateILinkCache(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
    } catch (error) {
      next(error);
    }
  };

  refactorHierarchy = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'RefactorRequest');

      const refactorResp = await this._nodeManager.refactorHierarchy(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
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
      next(error);
    }
  };

  bulkCreateNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'BulkCreateNode');

      const bulkCreateResp = await this._nodeManager.bulkCreateNode(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
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
      next(error);
    }
  };

  getArchivedNodes = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const getArchiveResp = await this._nodeManager.getArchivedNodes(
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).json(getArchiveResp);
    } catch (error) {
      next(error);
    }
  };
}

export default NodeController;
