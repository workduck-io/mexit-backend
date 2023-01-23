import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { NamespaceManager } from '../managers/NamespaceManager';
import { initializeNamespaceRoutes } from '../routes/NamespaceRoutes';

class NamespaceController {
  public _urlPath = '/namespace';
  public _router = express.Router();
  public _namespaceManager: NamespaceManager =
    container.get<NamespaceManager>(NamespaceManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);
  public _cache: Redis = container.get<Redis>(Redis);
  private _NSHierarchyLabel = 'NSHIERARCHY';

  constructor() {
    initializeNamespaceRoutes(this);
  }

  updateILinkCache = async (
    workspaceId: string,
    idToken: string,
    namespaceID: string
  ): Promise<any> => {
    const namespace = await this._namespaceManager.getNamespace(
      workspaceId,
      idToken,
      namespaceID
    );
    await this._cache.set(namespaceID, namespace);
  };

  createNamespace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = new RequestClass(request, 'CreateNamespace').data;
      await this._namespaceManager.createNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        body
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getNamespace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const namespace = await this._cache.getOrSet(
        {
          key: request.params.namespaceID,
        },
        () =>
          this._namespaceManager.getNamespace(
            response.locals.workspaceID,
            response.locals.idToken,
            request.params.namespaceID
          )
      );

      const parsedNS = this._transformer.namespaceHierarchyParser(namespace);
      response.status(statusCodes.OK).json(parsedNS);
    } catch (error) {
      next(error);
    }
  };

  updateNamespace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = new RequestClass(request, 'UpdateNamespace').data;

      await this._namespaceManager.updateNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        body
      );
      await this._cache.del(body.id);

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  makeNamespacePublic = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this._namespaceManager.makeNamespacePublic(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.namespaceID
      );
      await this._cache.del(request.params.namespaceID);

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  makeNamespacePrivate = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this._namespaceManager.makeNamespacePrivate(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.namespaceID
      );
      await this._cache.del(request.params.namespaceID);

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getAllNamespaces = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result: any[] = await this._namespaceManager.getAllNamespaces(
        response.locals.workspaceID,
        response.locals.idToken
      );

      const transformedResult = result.toObject('namespaceID');

      const ids = result.map(item => item.namespaceID);
      const cachedHits = (await this._cache.mget(ids))
        .filterEmpty()
        .map(hits => JSON.parse(hits));
      const nonCachedIds = ids.minus(cachedHits.map(item => item.id));

      const promises = nonCachedIds.map(id =>
        this._namespaceManager.getNamespace(
          response.locals.workspaceID,
          response.locals.idToken,
          id
        )
      );

      const allNamespacesResults = await Promise.all(promises);
      await this._cache.mset(
        allNamespacesResults.toObject('id', JSON.stringify)
      );
      const allResults = [...cachedHits, ...allNamespacesResults].map(ns => {
        ns.archiveNodeHierarchy = this._transformer.hierarchyParser(
          ns.archiveNodeHierarchy
        );
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

  getAllNamespaceHierarchy = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const forceRefresh = !!request.query['forceRefresh'];
      const getMetadata = !!request.query['getMetadata'];

      const parsedNamespaceHierarchy = (await this._cache.getOrSet(
        {
          key: this._transformer.encodeCacheKey(
            this._NSHierarchyLabel,
            response.locals.userId
          ),
          force: forceRefresh,
        },
        async () => {
          const result = await this._namespaceManager.getAllNamespaceHierarchy(
            response.locals.workspaceID,
            response.locals.idToken,
            getMetadata
          );
          const namespaceInfo = getMetadata ? result.hierarchy : result;
          const nodesMetadata = getMetadata ? result.nodesMetadata : undefined;
          return JSON.stringify(
            this._transformer.allNamespacesHierarchyParser(
              namespaceInfo,
              nodesMetadata
            )
          );
        }
      )) as any;

      response
        .status(statusCodes.OK)
        .json(JSON.parse(parsedNamespaceHierarchy));
    } catch (error) {
      next(error);
    }
  };

  shareNamespace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = new RequestClass(request, 'ShareNamespace').data;

      const accessTypeMap: Record<string, string[]> = {};

      Object.entries(body.userIDToAccessTypeMap).forEach(
        ([userID, accessType]) => {
          if (accessTypeMap[accessType]) accessTypeMap[accessType].push(userID);
          else accessTypeMap[accessType] = [userID];
        }
      );

      const backendRequestBodies = [];
      Object.entries(accessTypeMap).forEach(([accessType, userIDs]) => {
        backendRequestBodies.push({
          namespaceID: body.namespaceID,
          accessType: accessType,
          userIDs: userIDs,
        });
      });

      const promises = backendRequestBodies.map(i =>
        this._namespaceManager.shareNamespace(
          response.locals.workspaceID,
          response.locals.idToken,
          i
        )
      );

      await Promise.all(promises);

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  revokeAccessFromNamespace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = new RequestClass(request, 'RevokeAccessFromNamespace').data;
      await this._namespaceManager.revokeAccessFromNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        body
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getUsersInvitedToNamespace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._namespaceManager.getUsersOfSharedNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.namespaceID
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getNodeIDFromPath = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result: string = await this._namespaceManager.getNodeIDFromPath(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.namespaceID,
        request.params.path,
        request.query['nodeID'] as string
      );

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

  deleteNamespace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { successorNamespaceID } = new RequestClass(
        request,
        'DeleteNamespace'
      ).data;
      const namespaceID = request.params.namespaceID;

      await this._namespaceManager.deleteNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        namespaceID,
        successorNamespaceID
      );

      response.status(statusCodes.NO_CONTENT).send();

      await this._cache.del(namespaceID);
      if (successorNamespaceID) {
        await this._cache.del(successorNamespaceID);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default NamespaceController;
