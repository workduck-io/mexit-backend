import express, { NextFunction, Request, Response } from 'express';
import { CacheType } from '../interfaces/Config';
import { NodeResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { Cache } from '../libs/CacheClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { SnippetManager } from '../managers/SnippetManager';
import { initializeSnippetRoutes } from '../routes/SnippetRoutes';
class SnippetController {
  public _urlPath = '/snippet';
  public _router = express.Router();
  public _snippetManager: SnippetManager =
    container.get<SnippetManager>(SnippetManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);
  private _userAccessCache: Cache = container.get<Cache>(CacheType.UserAccess);
  private _snippetCache: Cache = container.get<Cache>(CacheType.Snippet);
  private _SnippetLabel = 'SNIPPET';
  private _UserAccessLabel = 'USERACCESS_SNIPPET';
  private _PublicSnippetMockWorkspace = 'PUBLIC';

  constructor() {
    initializeSnippetRoutes(this);
  }

  createSnippet = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const createNextVersion = request.query.createNextVersion === 'true';
      //TODO: update cache instead of deleting it
      this._snippetCache.del(request.body.id, this._SnippetLabel);
      const snippetResult = await this._snippetManager.createSnippet(
        response.locals.workspaceID,
        response.locals.idToken,
        request.body,
        createNextVersion
      );
      const deserialisedContent =
        this._transformer.genericNodeConverter(snippetResult);

      response.status(statusCodes.OK).json(deserialisedContent);
    } catch (error) {
      next(error);
    }
  };

  getSnippet = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const snippetId = request.params.snippetId;
      const userSpecificNodeKey = response.locals.userID + snippetId;

      const managerResponse = await this._snippetManager.getSnippet(
        snippetId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      const result = await this._snippetCache.getOrSet<NodeResponse>(
        snippetId,
        this._SnippetLabel,
        managerResponse,
        //Force get if user permission is not cached
        !this._userAccessCache.has(userSpecificNodeKey, this._UserAccessLabel)
      );
      this._userAccessCache.set(
        userSpecificNodeKey,
        this._UserAccessLabel,
        true
      );
      const convertedResponse = this._transformer.genericNodeConverter(result);

      response.status(statusCodes.OK).json(convertedResponse);
    } catch (error) {
      next(error);
    }
  };

  bulkGetSnippet = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      //TODO: Use cache.mGet to fetch only the snippets not in the cache
      const rawSnippets: any[] = await this._snippetManager.bulkGetSnippet(
        request.body['ids'],
        response.locals.workspaceID,
        response.locals.idToken
      );
      this._snippetCache.mset(
        rawSnippets.map(rs => ({
          key: rs.id,
          payload: rs,
        })),
        this._SnippetLabel
      );

      this._userAccessCache.mset(
        rawSnippets.map(rs => ({
          key: response.locals.workspaceID + rs.id,
          payload: rs,
        })),
        this._SnippetLabel
      );
      const result = rawSnippets.map(snippet =>
        this._transformer.genericNodeConverter(snippet)
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllVersionsOfSnippets = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._snippetManager.getAllVersionsOfSnippet(
        request.params.snippetId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllSnippetsOfWorkspace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const getData = request.query.getData === 'true';
      const result = await this._snippetManager.getAllSnippetsOfWorkspace(
        response.locals.workspaceID,
        response.locals.idToken,
        getData
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  makeSnippetPublic = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const snippetId = request.params.id;
      const version = request.params.version;
      await this._snippetManager.makeSnippetPublic(
        snippetId,
        version,
        response.locals.workspaceID,
        response.locals.idToken
      );
      this._userAccessCache.set(
        this._PublicSnippetMockWorkspace + request.params.id,
        this._SnippetLabel,
        true
      );

      response.status(statusCodes.OK).send();
    } catch (error) {
      next(error);
    }
  };
  makeSnippetPrivate = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const snippetId = request.params.id;
      const version = request.params.version;

      await this._snippetManager.makeSnippetPrivate(
        snippetId,
        version,
        response.locals.workspaceID,
        response.locals.idToken
      );
      this._userAccessCache.del(
        this._PublicSnippetMockWorkspace + snippetId,
        this._SnippetLabel
      );
      response.status(statusCodes.OK).send();
    } catch (error) {
      next(error);
    }
  };

  getPublicSnippet = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const snippetId = request.params.snippetId;
      const version = request.params.version;

      const managerResponse = await this._snippetManager.getPublicSnippet(
        snippetId,
        version,
        response.locals.workspaceID,
        response.locals.idToken
      );

      const result = await this._snippetCache.getOrSet<NodeResponse>(
        snippetId,
        this._SnippetLabel,
        managerResponse,
        //Force get if user permission is not cached
        !this._userAccessCache.has(
          this._PublicSnippetMockWorkspace + snippetId,
          this._UserAccessLabel
        )
      );

      const convertedResponse = this._transformer.genericNodeConverter(result);

      response.status(statusCodes.OK).json(convertedResponse);
    } catch (error) {
      next(error);
    }
  };

  clonePublicSnippet = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const snippetId = request.params.id;
      const version = request.params.version;

      const result = await this._snippetManager.clonePublicSnippet(
        snippetId,
        version,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default SnippetController;
