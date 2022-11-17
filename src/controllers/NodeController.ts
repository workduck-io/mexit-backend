import express, { NextFunction, Request, Response } from 'express';

import { NodeResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
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
  private _redisCache: Redis = container.get<Redis>(Redis);

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

    await this._redisCache.set(
      this._transformer.encodeCacheKey(this._NSHierarchyLabel, userId),
      parsedNamespaceHierarchy
    );

    return this._redisCache.get(
      this._transformer.encodeCacheKey(this._NSHierarchyLabel, userId)
    );
  };

  createNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ContentNodeRequest');
      //TODO: update cache instead of deleting it
      this._redisCache.del(
        this._transformer.encodeCacheKey(this._NodeLabel, requestDetail.data.id)
      );

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
      const userSpecificNodeKey = this._transformer.encodeCacheKey(
        this._UserAccessLabel,
        response.locals.userId,
        request.params.nodeId
      );
      const managerResponse = this._nodeManager.getNode(
        request.params.nodeId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      const result = await this._redisCache.getOrSet<NodeResponse>(
        {
          key: request.params.nodeId,
          force: !this._redisCache.has(userSpecificNodeKey),
        },
        async () => await managerResponse
      );

      this._redisCache.set(userSpecificNodeKey, request.params.nodeId);
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
      const namespaceID = request.query['namespaceID'] as string;
      const ids = requestDetail.data.ids;
      const cachedUserAccess = await this._redisCache.mget(
        ids.map(id =>
          this._transformer.encodeCacheKey(
            this._UserAccessLabel,
            response.locals.userId,
            id
          )
        )
      );

      const verifiedNodes = ids.intersection(cachedUserAccess); //Checking if user has acess)

      const cachedHits = (await this._redisCache.mget(verifiedNodes))
        .filterEmpty()
        .map(hits => JSON.parse(hits));

      const nonCachedIds = ids.minus(cachedHits.map(item => item.id));

      const managerResponse = !nonCachedIds.isEmpty()
        ? await this._nodeManager.getMultipleNode(
            nonCachedIds,
            response.locals.workspaceID,
            response.locals.idToken,
            namespaceID
          )
        : [];

      await this._redisCache.mset(
        managerResponse.toObject('id', JSON.stringify)
      );

      this._redisCache.mset(
        managerResponse.toObject(
          val =>
            this._transformer.encodeCacheKey(
              this._UserAccessLabel,
              response.locals.userId,
              val.id
            ),
          val => val.id
        )
      );
      response.status(statusCodes.OK).json({
        failed: managerResponse.failed,
        successful: [...managerResponse.successful, ...cachedHits],
      });
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
      this._redisCache.del(request.params.nodeId);
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

      this._redisCache.del(requestDetail.data.sourceNodeId);
      this._redisCache.del(requestDetail.data.destinationNodeId);

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
