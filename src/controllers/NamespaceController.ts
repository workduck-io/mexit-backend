import express, { NextFunction, Request, Response } from 'express';
import { Cache } from '../libs/CacheClass';
import container from '../inversify.config';
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
  public _cache: Cache = container.get<Cache>(Cache);
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
      const namespaceResult = await this._namespaceManager.createNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        request.body
      );

      response.status(statusCodes.OK).json(namespaceResult);
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
      const res = await this._namespaceManager.updateNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        request.body
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
        this._cache.has(response.locals.userId, this._NSHierarchyLabel) &&
        !forceRefresh
      ) {
        parsedNamespaceHierarchy = await this._cache.get(
          response.locals.userId,
          this._NSHierarchyLabel
        );
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
          response.locals.userId,
          this._NSHierarchyLabel,
          parsedNamespaceHierarchy
        );
      }

      response.status(statusCodes.OK).json(parsedNamespaceHierarchy);
    } catch (error) {
      next(error);
    }
  };
}

export default NamespaceController;
