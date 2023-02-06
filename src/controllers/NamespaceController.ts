import express, { NextFunction, Request, Response } from 'express';

import { STAGE } from '../env';
import { LocalsX } from '../interfaces/Locals';
import container from '../inversify.config';
import { invokeAndCheck } from '../libs/LambdaInvoker';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { initializeNamespaceRoutes } from '../routes/NamespaceRoutes';
import { generateLambdaInvokePayload } from '../utils/lambda';

class NamespaceController {
  public _urlPath = '/namespace';
  public _router = express.Router();

  private _transformer: Transformer = container.get<Transformer>(Transformer);
  private _cache: Redis = container.get<Redis>(Redis);
  private _NSHierarchyLabel = 'NSHIERARCHY';
  private _namespaceLambdaFunctionName = `mex-backend-${STAGE}-Namespace`;

  constructor() {
    initializeNamespaceRoutes(this);
  }

  updateILinkCache = async (locals: LocalsX, namespaceID: string): Promise<any> => {
    const payload = generateLambdaInvokePayload(locals, 'getNamespace', {
      pathParameters: { id: namespaceID },
    });

    const namespace = await invokeAndCheck(this._namespaceLambdaFunctionName, 'RequestResponse', payload);
    await this._cache.set(namespaceID, namespace);
  };

  createNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'CreateNamespace').data;

      response.locals.invoker(this._namespaceLambdaFunctionName, 'createNamespace', {
        payload: { ...body, type: 'NamespaceRequest' },
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const namespaceID = request.params.namespaceID;
      const namespace = await this._cache.getOrSet(
        {
          key: namespaceID,
        },
        () =>
          response.locals.invoker(this._namespaceLambdaFunctionName, 'getNamespace', {
            pathParameters: { id: namespaceID },
          })
      );

      const parsedNS = this._transformer.namespaceHierarchyParser(namespace);
      response.status(statusCodes.OK).json(parsedNS);
    } catch (error) {
      next(error);
    }
  };

  updateNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'UpdateNamespace').data;
      await response.locals.invoker(this._namespaceLambdaFunctionName, 'updateNamespace', {
        payload: { ...body, type: 'NamespaceRequest' },
      });

      await this._cache.del(body.id);

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  makeNamespacePublic = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const namespaceID = request.params.namespaceID;
      await response.locals.invoker(this._namespaceLambdaFunctionName, 'makeNamespacePublic', {
        pathParameters: { id: namespaceID },
      });
      await this._cache.del(namespaceID);

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  makeNamespacePrivate = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const namespaceID = request.params.namespaceID;
      await response.locals.invoker(this._namespaceLambdaFunctionName, 'makeNamespacePrivate', {
        pathParameters: { id: namespaceID },
      });
      await this._cache.del(namespaceID);

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getAllNamespaces = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result: any[] = await response.locals.invoker(this._namespaceLambdaFunctionName, 'getAllNamespaces');

      const transformedResult = result.toObject('namespaceID');

      const ids = result.map(item => item.namespaceID);
      const cachedHits = (await this._cache.mget(ids)).filterEmpty().map(hits => JSON.parse(hits));
      const nonCachedIds = ids.minus(cachedHits.map(item => item.id));

      const allNamespacesResults = (
        await response.locals.invoker(this._namespaceLambdaFunctionName, 'getNamespace', {
          allSettled: {
            ids: nonCachedIds,
            key: 'id',
          },
        })
      )
        .filter(p => p.status === 'fulfilled')
        .map((p: PromiseFulfilledResult<any>) => p.value);

      await this._cache.mset(allNamespacesResults.toObject('id', JSON.stringify));
      const allResults = [...cachedHits, ...allNamespacesResults].map(ns => {
        ns.archiveNodeHierarchy = this._transformer.hierarchyParser(ns.archiveNodeHierarchy);
        ns.nodeHierarchy = this._transformer.hierarchyParser(ns.nodeHierarchy);
        ns.accessType = transformedResult[ns.id].accessType;
        ns.granterID = transformedResult[ns.id].granterID;
        return ns;
      });

      response.status(statusCodes.OK).json(allResults);
    } catch (error) {
      next(error);
    }
  };

  getAllNamespaceHierarchy = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const forceRefresh = !!request.query['forceRefresh'];
      const getMetadata = !!request.query['getMetadata'];

      const parsedNamespaceHierarchy = (await this._cache.getOrSet(
        {
          key: this._transformer.encodeCacheKey(this._NSHierarchyLabel, response.locals.userId),
          force: forceRefresh,
        },
        async () => {
          const result = await response.locals.invoker(this._namespaceLambdaFunctionName, 'getAllNamespaceHierarchy', {
            queryStringParameters: { getMetadata: getMetadata },
          });

          const namespaceInfo = getMetadata ? result.hierarchy : result;
          const nodesMetadata = getMetadata ? result.nodesMetadata : undefined;
          return JSON.stringify(this._transformer.allNamespacesHierarchyParser(namespaceInfo, nodesMetadata));
        }
      )) as any;

      response.status(statusCodes.OK).json(JSON.parse(parsedNamespaceHierarchy));
    } catch (error) {
      next(error);
    }
  };

  shareNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'ShareNamespace').data;

      const accessTypeMap: Record<string, string[]> = {};

      Object.entries(body.userIDToAccessTypeMap).forEach(([userID, accessType]) => {
        if (accessTypeMap[accessType]) accessTypeMap[accessType].push(userID);
        else accessTypeMap[accessType] = [userID];
      });

      const backendRequestBodies = [];
      Object.entries(accessTypeMap).forEach(([accessType, userIDs]) => {
        backendRequestBodies.push({
          namespaceID: body.namespaceID,
          accessType: accessType,
          userIDs: userIDs,
          type: 'SharedNamespaceRequest',
        });
      });

      const promises = backendRequestBodies.map(i =>
        response.locals.invoker(this._namespaceLambdaFunctionName, 'shareNamespace', { payload: i })
      );

      await Promise.all(promises);

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  revokeAccessFromNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'RevokeAccessFromNamespace').data;

      await response.locals.invoker(this._namespaceLambdaFunctionName, 'revokeUserAccessFromNamespace', {
        payload: { ...body, type: 'SharedNamespaceRequest' },
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getUsersInvitedToNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker(this._namespaceLambdaFunctionName, 'getUsersOfSharedNamespace', {
        pathParameters: { id: request.params.namespaceID },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getNodeIDFromPath = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const { path, namespaceID } = request.params;
      const nodeID = request.query['nodeID'] as string;

      const result: string = await response.locals.invoker(this._namespaceLambdaFunctionName, 'getNodeIDFromPath', {
        pathParameters: { namespaceID: namespaceID, path: path },
        ...(nodeID && { queryStringParameters: { nodeID: nodeID } }),
      });

      if (result.length === 0) {
        response.status(statusCodes.BAD_REQUEST).json({
          message: 'Invalid Path or NamespaceID. Node not found',
          statusCode: statusCodes.BAD_REQUEST,
        });
      } else {
        response.status(statusCodes.OK).json(result);
      }
    } catch (error) {
      next(error);
    }
  };

  deleteNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const { successorNamespaceID } = new RequestClass(request, 'DeleteNamespace').data;
      const namespaceID = request.params.namespaceID;

      await response.locals.invoker(this._namespaceLambdaFunctionName, 'deleteNamespace', {
        pathParameters: { id: namespaceID },
        ...(successorNamespaceID && {
          payload: {
            type: 'SuccessorNamespaceRequest',
            successorNamespaceID: successorNamespaceID,
            action: 'delete',
          },
        }),
      });

      this._cache.del(namespaceID);
      if (successorNamespaceID) {
        this.updateILinkCache(response.locals, successorNamespaceID);
      }
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

export default NamespaceController;
