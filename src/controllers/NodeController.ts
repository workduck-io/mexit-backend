import express, { Request, Response, NextFunction } from 'express';
import container from '../inversify.config';
import { NodeManager } from '../managers/NodeManager';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { ShortenerManager } from '../managers/ShortenerManager';
import { NodeResponse } from '../interfaces/Response';
import { Cache } from '../libs/CacheClass';
import { initializeNodeRoutes } from '../routes/NodeRoutes';
import { NamespaceManager } from '../managers/NamespaceManager';

class NodeController {
  public _urlPath = '/node';
  public _router = express.Router();
  public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);
  public _shortenerManager: ShortenerManager =
    container.get<ShortenerManager>(ShortenerManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);
  private _cache: Cache = container.get<Cache>(Cache);
  private _NSHierarchyLabel = 'NSHIERARCHY';
  private _nsManager: NamespaceManager =
    container.get<NamespaceManager>(NamespaceManager);

  constructor() {
    initializeNodeRoutes(this);
  }

  updateILinkCache = async (
    userId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> => {
    const nsHierarchy = await this._nsManager.getAllNamespaceHierarchy(
      workspaceId,
      idToken,
      true
    );

    const { hierarchy, nodesMetadata } = nsHierarchy;
    const parsedNamespaceHierarchy =
      this._transformer.allNamespacesHierarchyParser(hierarchy, nodesMetadata);

    this._cache.replaceAndSet(
      userId,
      this._NSHierarchyLabel,
      parsedNamespaceHierarchy
    );

    return this._cache.get(userId, this._NSHierarchyLabel);
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
        requestDetail.data,
        request.params.namespaceID
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
      const { changedPaths } = refactorResp;
      const parsedChangedPathsRefactor =
        this._transformer.refactoredPathsHierarchyParser(changedPaths);

      response
        .status(statusCodes.OK)
        .json({ changedPaths: parsedChangedPathsRefactor });

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
      const { node, changedPaths } = bulkCreateResp;
      const parsedChangedPathsRefactor =
        this._transformer.refactoredPathsHierarchyParser(changedPaths);

      response
        .status(statusCodes.OK)
        .json({ node, changedPaths: parsedChangedPathsRefactor });

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
