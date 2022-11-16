import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import {
  ParsedNamespaceHierarchy,
  Transformer,
} from '../libs/TransformerClass';
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
      const namespace = await this._namespaceManager.getNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.namespaceID
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

      const transformedResult = result.reduce(
        (obj, item) => ((obj[item.namespaceID] = item), obj),
        {}
      );

      const ids = Object.keys(transformedResult);
      const promises = ids.map(id =>
        this._namespaceManager.getNamespace(
          response.locals.workspaceID,
          response.locals.idToken,
          id
        )
      );

      const allNamespacesResults = await Promise.all(promises);
      allNamespacesResults.forEach(ns => {
        ns.nodeHierarchy = this._transformer.hierarchyParser(ns.nodeHierarchy);
        ns.accessType = transformedResult[ns.id].accessType;
        ns.granterID = transformedResult[ns.id].granterID;
      });

      response.status(statusCodes.OK).json(allNamespacesResults);
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

      let parsedNamespaceHierarchy: Record<string, ParsedNamespaceHierarchy>;

      if (
        this._cache.has(
          this._transformer.encodeCacheKey(
            this._NSHierarchyLabel,
            response.locals.userId
          )
        ) &&
        !forceRefresh
      ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        parsedNamespaceHierarchy = (await this._cache.get(
          response.locals.userId,
          this._NSHierarchyLabel
        )) as any;
      } else {
        const result = await this._namespaceManager.getAllNamespaceHierarchy(
          response.locals.workspaceID,
          response.locals.idToken,
          getMetadata
        );
        const namespaceInfo = getMetadata ? result.hierarchy : result;
        const nodesMetadata = getMetadata ? result.nodesMetadata : undefined;
        parsedNamespaceHierarchy =
          this._transformer.allNamespacesHierarchyParser(
            namespaceInfo,
            nodesMetadata
          );

        this._cache.set(
          this._transformer.encodeCacheKey(
            this._NSHierarchyLabel,
            response.locals.userId
          ),
          parsedNamespaceHierarchy
        );
      }

      response.status(statusCodes.OK).json(parsedNamespaceHierarchy);
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
      const result = await this._namespaceManager.revokeAccessFromNamespace(
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
}

export default NamespaceController;
