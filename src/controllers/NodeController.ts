import express, { NextFunction, Request, Response } from 'express';
import { CacheType } from '../interfaces/Config';
import { NodeResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { Cache } from '../libs/CacheClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { LinkManager } from '../managers/LinkManager';
import { NamespaceManager } from '../managers/NamespaceManager';
import { NodeManager } from '../managers/NodeManager';
import { initializeNodeRoutes } from '../routes/NodeRoutes';

class NodeController {
  public _urlPath = '/node';
  public _router = express.Router();
  public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);
  public _linkManager: LinkManager = container.get<LinkManager>(LinkManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);
  private _iLinkCache: Cache = container.get<Cache>(
    CacheType.NamespaceHierarchy
  );
  private _nodeCache: Cache = container.get<Cache>(CacheType.Node);
  private _userAccessCache: Cache = container.get<Cache>(CacheType.UserAccess);
  private _NSHierarchyLabel = 'NSHIERARCHY';
  private _NodeLabel = 'NODE';
  private _UserAccessLabel = 'USERACCESS';
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

    this._iLinkCache.replaceAndSet(
      userId,
      this._NSHierarchyLabel,
      parsedNamespaceHierarchy
    );

    return this._iLinkCache.get(userId, this._NSHierarchyLabel);
  };

  createNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ContentNodeRequest');
      //TODO: update cache instead of deleting it
      this._nodeCache.del(requestDetail.data.id, this._NodeLabel);

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
      const userSpecificNodeKey =
        response.locals.userId + request.params.nodeId;

      const managerResponse = await this._nodeManager.getNode(
        request.params.nodeId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      const result = await this._nodeCache.getOrSet<NodeResponse>(
        request.params.nodeId,
        this._NodeLabel,
        managerResponse, //Force get if user permission is not cached
        !this._userAccessCache.has(userSpecificNodeKey, this._UserAccessLabel)
      );
      this._userAccessCache.set(
        userSpecificNodeKey,
        this._UserAccessLabel,
        true
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMultipleNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'GetMultipleNode');
      const cachedUserAcess = this._userAccessCache.mget(
        requestDetail.data.ids.map(id => response.locals.userId + id),
        this._UserAccessLabel
      );
      const cachedHits = Object.entries(
        this._nodeCache.mget(requestDetail.data.ids, this._NodeLabel)
      );
      const verifiedCachedHits = cachedHits
        .filter(
          ([k, _]) =>
            Object.keys(cachedUserAcess)
              .map(key => this._transformer.decodeCacheKey(key)[1])
              .includes(
                response.locals.userId + this._transformer.decodeCacheKey(k)[1]
              ) //Checking if user has acess
        )
        .map(([_, v]) => v as any);
      const nonCachedIds = requestDetail.data.ids.filter(
        id =>
          verifiedCachedHits
            .map(item => item.id)
            .filter(cachedId => id === cachedId).length === 0
      ); //Fetch only non-cached ids in the next step

      const managerResponse =
        nonCachedIds.length > 0
          ? await this._nodeManager.getMultipleNode(
              nonCachedIds,
              response.locals.workspaceID,
              response.locals.idToken
            )
          : [];
      this._nodeCache.mset(
        managerResponse.map(node => ({
          key: node.id,
          payload: node,
        })),
        this._NodeLabel
      );
      this._userAccessCache.mset(
        managerResponse.map(node => ({
          key: response.locals.userId + node.id,
          payload: true,
        })),
        this._UserAccessLabel
      );
      response
        .status(statusCodes.OK)
        .json([...managerResponse, ...verifiedCachedHits]);
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
      this._nodeCache.del(request.params.nodeId, this._NodeLabel);
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

      this._nodeCache.del(requestDetail.data.sourceNodeId, this._NodeLabel);
      this._nodeCache.del(
        requestDetail.data.destinationNodeId,
        this._NodeLabel
      );

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
