import express, { NextFunction, Request, Response } from 'express';

import { CopyOrMoveBlock } from '../interfaces/Node';
import { NodeResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { initializeNodeRoutes } from '../routes/NodeRoutes';
import { LocalsX } from '../utils/Locals';

class NodeController {
  public _urlPath = '/node';
  public _router = express.Router();
  private _transformer: Transformer = container.get<Transformer>(Transformer);
  private _redisCache: Redis = container.get<Redis>(Redis);

  private _UserAccessLabel = 'USERACCESS';

  constructor() {
    initializeNodeRoutes(this);
  }

  clearILinkCache = async (locals: LocalsX, namespaceID: string): Promise<any> => {
    await this._redisCache.del(namespaceID);
  };

  createNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'ContentNodeRequest').data;

      //TODO: update cache instead of deleting it
      this._redisCache.del(body.id);
      const nodeResult = await response.locals.invoker(
        'CreateNode',
        {
          payload: { ...body, type: 'NodeRequest' },
        },
        'APIGateway'
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, ...rest } = nodeResult; //Dont relay data to frontend
      await response.locals.broadcaster({
        operationType: 'CREATE',
        entityType: 'NOTE',
        entityId: body.id,
      });
      response.status(statusCodes.OK).json(rest);

      await this.clearILinkCache(response.locals, body.namespaceID);
    } catch (error) {
      next(error);
    }
  };

  getNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const nodeId = request.params.nodeId;
      const namespaceID = (request.query['namespaceID'] as string) ?? undefined;
      const userSpecificNodeKey = this._transformer.encodeCacheKey(
        this._UserAccessLabel,
        response.locals.userId,
        nodeId
      );

      const result = await this._redisCache.getOrSet<NodeResponse>(
        {
          key: nodeId,
          force: !this._redisCache.has(userSpecificNodeKey),
        },
        () =>
          response.locals.invoker(
            'GetNode',
            {
              pathParameters: { id: nodeId },
              ...(namespaceID && { queryStringParameters: { namespaceID: namespaceID } }),
            },
            'APIGateway'
          )
      );

      this._redisCache.set(userSpecificNodeKey, nodeId);
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMultipleNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'GetMultipleIds');
      const namespaceID = request.query['namespaceID'] as string;
      const ids = requestDetail.data.ids;
      const cachedUserAccess = await this._redisCache.mget(
        ids.map(id => this._transformer.encodeCacheKey(this._UserAccessLabel, response.locals.userId, id))
      );

      const verifiedNodes = ids.intersection(cachedUserAccess); //Checking if user has acess)
      const cachedHits = (await this._redisCache.mget(verifiedNodes)).filterEmpty().map(hits => JSON.parse(hits));

      const nonCachedIds = ids.minus(cachedHits.map(item => item.id));

      const lambdaResponse = { successful: [], failed: [] };
      if (!nonCachedIds.isEmpty()) {
        const rawLambdaResp = await response.locals.invoker('GetMultipleNodes', {
          payload: { ids: nonCachedIds },
          ...(namespaceID && {
            queryStringParameters: { namespaceID: namespaceID },
          }),
        });
        const fetchedIDs = new Set(rawLambdaResp.map(node => node.id));
        const failedIDs = nonCachedIds.filter(id => !fetchedIDs.has(id));

        lambdaResponse.successful = rawLambdaResp;
        lambdaResponse.failed = failedIDs;

        await this._redisCache.mset(lambdaResponse.successful.toObject('id', JSON.stringify));

        await this._redisCache.mset(
          lambdaResponse.successful.toObject(
            val => this._transformer.encodeCacheKey(this._UserAccessLabel, response.locals.userId, val.id),
            val => val.id
          )
        );
      }
      response.status(statusCodes.OK).json({
        failed: lambdaResponse.failed,
        successful: [...lambdaResponse.successful, ...cachedHits],
      });
    } catch (error) {
      next(error);
    }
  };

  appendNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const blockDetail = new RequestClass(request, 'AppendBlockRequest').data;
      const nodeID = request.params.nodeId;
      const result = await response.locals.invoker(
        'AppendNode',
        {
          payload: { ...blockDetail, type: 'ElementRequest' },
          pathParameters: { id: nodeID },
        },
        'APIGateway'
      );
      await response.locals.broadcaster({
        operationType: 'UPDATE',
        entityType: 'NOTE',
        entityId: nodeID,
      });
      this._redisCache.del(nodeID);
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteBlocks = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const nodeBlockMap = new RequestClass(request, 'DeleteBlocksRequest').data;

      const result = Object.entries(nodeBlockMap).map(([nodeId, blockIds]) => {
        response.locals.broadcaster({
          operationType: 'UPDATE',
          entityType: 'NOTE',
          entityId: nodeId,
        });
        return response.locals.invoker(
          'DeleteBlocks',
          {
            pathParameters: { id: nodeId },
            payload: { ids: blockIds },
          },
          'APIGateway'
        );
      });
      this._redisCache.mdel(Object.keys(nodeBlockMap));

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  copyOrMoveBlock = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const data = new RequestClass(request, 'CopyOrMoveBlockRequest').data;

      this._redisCache.del(data.sourceNodeId);
      this._redisCache.del(data.destinationNodeId);

      const payload: CopyOrMoveBlock = {
        action: 'move',
        type: 'BlockMovementRequest',
        blockID: data.blockId,
        sourceNodeID: data.sourceNodeId,
        destinationNodeID: data.destinationNodeId,
      };
      await response.locals.invoker('CopyOrMoveBlock', { payload: payload }, 'APIGateway');
      await Promise.allSettled([
        response.locals.broadcaster({
          operationType: 'UPDATE',
          entityType: 'NOTE',
          entityId: data.sourceNodeId,
        }),
        response.locals.broadcaster({
          operationType: 'UPDATE',
          entityType: 'NOTE',
          entityId: data.destinationNodeId,
        }),
      ]);

      response.status(statusCodes.NO_CONTENT).json();
    } catch (error) {
      next(error);
    }
  };

  makeNodePublic = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const nodeId = request.params.id;
      await response.locals.invoker('MakeNodePublic', { pathParameters: { id: nodeId } }, 'APIGateway');
      await response.locals.broadcaster({
        operationType: 'UPDATE',
        entityType: 'NOTE',
        entityId: nodeId,
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  makeNodePrivate = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const nodeId = request.params.id;
      await response.locals.invoker('MakeNodePrivate', { pathParameters: { id: nodeId } }, 'APIGateway');
      await response.locals.broadcaster({
        operationType: 'UPDATE',
        entityType: 'NOTE',
        entityId: nodeId,
      });
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  archiveNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'ArchiveNodeDetail').data;
      const namespaceID = request.query['namespaceID'] as string;

      if (!namespaceID) {
        response.status(statusCodes.BAD_REQUEST).json({ message: 'NamespaceID missing in query parameters' });
      }

      const archiveNodeResult = await response.locals.invoker(
        'ArchiveNode',
        {
          payload: body,
          queryStringParameters: { namespaceID: namespaceID },
        },
        'APIGateway'
      );

      await this.clearILinkCache(response.locals, namespaceID);
      response.status(statusCodes.OK).json(archiveNodeResult);
    } catch (error) {
      next(error);
    }
  };

  deleteArchivedNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'ArchiveNodeDetail').data;

      await response.locals.invoker(
        'DeleteArchivedNode',
        {
          payload: body,
        },
        'APIGateway'
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  unArchiveNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'ArchiveNodeDetail').data;
      const namespaceID = request.query['namespaceID'];

      if (!namespaceID) {
        response.status(statusCodes.BAD_REQUEST).json({ message: 'NamespaceID missing in query parameters' });
      }

      const archiveNodeResult = await response.locals.invoker(
        'UnarchiveNode',
        {
          payload: body,
          queryStringParameters: { namespaceID: namespaceID },
        },
        'APIGateway'
      );

      response.status(statusCodes.OK).json(archiveNodeResult);
    } catch (error) {
      next(error);
    }
  };

  refactorHierarchy = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'RefactorRequest').data;

      const refactorResp = await response.locals.invoker(
        'RefactorHierarchy',
        {
          payload: { ...body, type: 'RefactorRequest' },
        },
        'APIGateway'
      );

      const { changedPaths } = refactorResp;
      const parsedChangedPathsRefactor = this._transformer.refactoredPathsHierarchyParser(changedPaths);
      await response.locals.broadcaster({
        operationType: 'UPDATE',
        entityType: 'NAMESPACE',
        entityId: body.nodeID,
        payload: {
          body: { changedPaths: parsedChangedPathsRefactor },
        },
      });
      await this._redisCache.mdel([body.existingNodePath.namespaceID, body.newNodePath.namespaceID]);
      response.status(statusCodes.OK).json({ changedPaths: parsedChangedPathsRefactor });
    } catch (error) {
      next(error);
    }
  };

  bulkCreateNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'BulkCreateNode').data;

      const bulkCreateResp = await response.locals.invoker(
        'BulkCreateNode',
        {
          payload: { ...body, type: 'NodeBulkRequest' },
        },
        'APIGateway'
      );

      const { node, changedPaths } = bulkCreateResp;

      await response.locals.broadcaster({
        operationType: 'CREATE',
        entityType: 'NOTE',
        entityId: body.id,
      });

      //TODO: Make part of TransformClass
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, dataOrder, ...rest } = node; //Dont relay data to frontend
      const parsedChangedPathsRefactor = this._transformer.refactoredPathsHierarchyParser(changedPaths);

      await this.clearILinkCache(response.locals, body.nodePath.namespaceID);
      response.status(statusCodes.OK).json({ node: rest, changedPaths: parsedChangedPathsRefactor });
    } catch (error) {
      next(error);
    }
  };

  getArchivedNodes = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const getArchiveResp = await response.locals.invoker('GetArchivedNodes', undefined, 'APIGateway');
      response.status(statusCodes.OK).json(getArchiveResp);
    } catch (error) {
      next(error);
    }
  };

  updateNodeMetadata = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const nodeID = request.params.id;
      const body = new RequestClass(request, 'UpdateMetadata').data;

      await response.locals.invoker(
        'UpdateNodeMetadata',
        { payload: { ...body, type: 'MetadataRequest' }, pathParameters: { id: nodeID } },
        'APIGateway'
      );
      await response.locals.broadcaster({
        operationType: 'UPDATE',
        entityType: 'NOTE',
        entityId: nodeID,
      });

      this._redisCache.del(nodeID);
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

export default NodeController;
