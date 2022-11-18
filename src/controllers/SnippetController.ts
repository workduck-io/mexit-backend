import express, { NextFunction, Request, Response } from 'express';
import { NodeResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
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
  private _redisCache: Redis = container.get<Redis>(Redis);
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
      this._redisCache.del(request.body.id);
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
      const userSpecificNodeKey = this._transformer.encodeCacheKey(
        this._UserAccessLabel,
        response.locals.userId,
        snippetId
      );

      const managerResponse = this._snippetManager.getSnippet(
        snippetId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      const result = await this._redisCache.getOrSet<NodeResponse>(
        {
          key: snippetId,
          //Force get if user permission is not cached
          force: !this._redisCache.has(userSpecificNodeKey),
        },
        () => managerResponse
      );
      this._redisCache.set(userSpecificNodeKey, snippetId);
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
      const requestDetail = new RequestClass(request, 'GetMultipleIds');
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

      const verifiedSnippets = ids.intersection(cachedUserAccess); //Checking if user has acess)

      const cachedHits = (await this._redisCache.mget(verifiedSnippets))
        .filterEmpty()
        .map(hits => JSON.parse(hits));

      const nonCachedIds = ids.minus(cachedHits.map(item => item.id));

      const { successful, failed } = !nonCachedIds.isEmpty()
        ? await this._snippetManager.bulkGetSnippet(
            nonCachedIds,
            response.locals.workspaceID,
            response.locals.idToken
          )
        : { successful: [], failed: [] };

      await this._redisCache.mset(successful.toObject('id', JSON.stringify));

      this._redisCache.mset(
        successful.toObject(
          val =>
            this._transformer.encodeCacheKey(
              this._UserAccessLabel,
              response.locals.userId,
              val.id
            ),
          val => val.id
        )
      );
      const result = [...successful, ...cachedHits].map(snippet =>
        this._transformer.genericNodeConverter(snippet)
      );

      response
        .status(statusCodes.OK)
        .json({ successful: result, failed: failed });
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
      this._redisCache.set(
        this._PublicSnippetMockWorkspace + request.params.id,
        snippetId
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
      this._redisCache.del(
        this._transformer.encodeCacheKey(
          this._PublicSnippetMockWorkspace,
          snippetId
        )
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

      const managerResponse = this._snippetManager.getPublicSnippet(
        snippetId,
        version,
        response.locals.workspaceID,
        response.locals.idToken
      );

      const result = await this._redisCache.getOrSet<NodeResponse>(
        {
          key: snippetId,
          //Force get if user permission is not cached
          force: !this._redisCache.has(
            this._transformer.encodeCacheKey(
              this._PublicSnippetMockWorkspace,
              snippetId
            )
          ),
        },
        () => managerResponse
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

  deleteVersionOfSnippet = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const snippetID = request.params.id;

      // If a version is not passed in query parameters, it deletes the latest version
      const version = request.query['version']
        ? parseInt(request.query['version'] as string)
        : undefined;

      await this._snippetManager.deleteVersionOfSnippet(
        snippetID,
        response.locals.workspaceID,
        response.locals.idToken,
        version
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  deleteAllVersionsOfSnippet = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const snippetID = request.params.id;

      await this._snippetManager.deleteAllVersionsOfSnippet(
        snippetID,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

export default SnippetController;
