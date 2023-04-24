import express, { NextFunction, Request, Response } from 'express';

import { CopyOrMoveBlock } from '../interfaces/Node';
import { NodeResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { globalInvoker } from '../middlewares/invoker';
import { initializeNodeRoutes } from '../routes/NodeRoutes';
import { LocalsX } from '../utils/Locals';
import { mog } from '../utils/mog';

class NodeController {
  public _urlPath = '/node';
  public _router = express.Router();
  private _transformer: Transformer = container.get<Transformer>(Transformer);
  private _redisCache: Redis = container.get<Redis>(Redis);

  private _UserAccessLabel = 'USERACCESS';

  constructor() {
    initializeNodeRoutes(this);
  }

  updateILinkCache = async (locals: LocalsX, namespaceID: string): Promise<any> => {
    const namespace = await locals.invoker('getNamespace', { pathParameters: { id: namespaceID } }, 'APIGateway');
    await this._redisCache.set(namespaceID, namespace);
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
      response.status(statusCodes.OK).json(rest);

      await this.updateILinkCache(response.locals, body.namespaceID);
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

      if (!nonCachedIds.isEmpty()) {
        mog('Fetching Nodes', { nonCachedIds, ids });
        const locals = {
          'mex-workspace-id': response.locals?.workspaceID ?? '',
          authorization: response.locals?.idToken,
        } as any;

        const rawLambdaResp: any[] = await globalInvoker(
          'GetMultipleNodes',
          locals,
          {
            payload: { ids: nonCachedIds },
            ...(namespaceID && {
              queryStringParameters: { namespaceID: namespaceID },
            }),
          },
          'APIGateway'
        );
        const fetchedIDs = new Set(rawLambdaResp.map(node => node.id));
        const failedIDs = nonCachedIds.filter(id => !fetchedIDs.has(id));
        mog('FETCHED/FAILED Safe', { fetchedIDs, failedIDs });
        await this._redisCache.mset(rawLambdaResp.toObject('id', JSON.stringify));

        await this._redisCache.mset(
          rawLambdaResp.toObject(
            val => this._transformer.encodeCacheKey(this._UserAccessLabel, response.locals.userId, val.id),
            val => val.id
          )
        );
        mog('Lambda Response', {
          successful: rawLambdaResp.map(item => item.id),
          failed: failedIDs,
          cachedHits: cachedHits.map(item => item.id),
        });
        response.status(statusCodes.OK).json({
          failed: failedIDs,
          successful: [...rawLambdaResp, ...cachedHits],
        });
      }
      response.status(statusCodes.OK).json({
        failed: [],
        successful: cachedHits,
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

      response.status(statusCodes.NO_CONTENT).json();
    } catch (error) {
      next(error);
    }
  };

  makeNodePublic = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const nodeId = request.params.id;
      await response.locals.invoker('MakeNodePublic', { pathParameters: { id: nodeId } }, 'APIGateway');

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  makeNodePrivate = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const nodeId = request.params.id;
      await response.locals.invoker('MakeNodePrivate', { pathParameters: { id: nodeId } }, 'APIGateway');

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

      response.status(statusCodes.OK).json(archiveNodeResult);

      await this.updateILinkCache(response.locals, namespaceID);
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

      response.status(statusCodes.OK).json({ changedPaths: parsedChangedPathsRefactor });

      await this.updateILinkCache(response.locals, body.existingNodePath.namespaceID);
      await this.updateILinkCache(response.locals, body.newNodePath.namespaceID);
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
      //TODO: Make part of TransformClass
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, dataOrder, ...rest } = node; //Dont relay data to frontend
      const parsedChangedPathsRefactor = this._transformer.refactoredPathsHierarchyParser(changedPaths);

      response.status(statusCodes.OK).json({ node: rest, changedPaths: parsedChangedPathsRefactor });

      await this.updateILinkCache(response.locals, body.nodePath.namespaceID);
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
      this._redisCache.del(nodeID);
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

export default NodeController;
