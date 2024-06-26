import express, { NextFunction, Request, Response } from 'express';

import { NodeResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { initializeSnippetRoutes } from '../routes/SnippetRoutes';

class SnippetController {
  public _urlPath = '/snippet';
  public _router = express.Router();

  private _transformer: Transformer = container.get<Transformer>(Transformer);
  private _redisCache: Redis = container.get<Redis>(Redis);
  private _UserAccessLabel = 'USERACCESS_SNIPPET';
  private _PublicSnippetMockWorkspace = 'PUBLIC';

  constructor() {
    initializeSnippetRoutes(this);
  }

  createSnippet = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const createNextVersion = request.query.createNextVersion === 'true';
      //TODO: update cache instead of deleting it
      this._redisCache.del(request.body.id);
      const snippetResult = await response.locals.invoker('createSnippet', {
        payload: request.body,
        queryStringParameters: { createNextVersion: createNextVersion },
      });

      const deserialisedContent = this._transformer.genericNodeConverter(snippetResult, false);
      await response.locals.broadcaster({
        operationType: 'CREATE',
        entityType: 'SNIPPET',
        entityId: request.body.id,
      });
      response.status(statusCodes.OK).json(deserialisedContent);
    } catch (error) {
      next(error);
    }
  };

  getSnippet = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const snippetId = request.params.snippetId;
      const userSpecificNodeKey = this._transformer.encodeCacheKey(
        this._UserAccessLabel,
        response.locals.userId,
        snippetId
      );

      const result = await this._redisCache.getOrSet<NodeResponse>(
        {
          key: snippetId,
          //Force get if user permission is not cached
          force: !this._redisCache.has(userSpecificNodeKey),
        },
        () =>
          response.locals.invoker('getSnippet', {
            pathParameters: { id: snippetId },
          })
      );
      this._redisCache.set(userSpecificNodeKey, snippetId);
      const convertedResponse = this._transformer.genericNodeConverter(result);

      response.status(statusCodes.OK).json(convertedResponse);
    } catch (error) {
      next(error);
    }
  };

  bulkGetSnippet = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'GetMultipleIds');
      const ids = requestDetail.data.ids;
      const cachedUserAccess = await this._redisCache.mget(
        ids.map(id => this._transformer.encodeCacheKey(this._UserAccessLabel, response.locals.userId, id))
      );

      const verifiedSnippets = ids.intersection(cachedUserAccess); //Checking if user has acess)

      const cachedHits = (await this._redisCache.mget(verifiedSnippets)).filterEmpty().map(hits => JSON.parse(hits));

      const nonCachedIds = ids.minus(cachedHits.map(item => item.id));

      const lambdaResponse = { successful: [], failed: [] };

      if (!nonCachedIds.isEmpty()) {
        const rawLambdaResponse = await response.locals.invoker('getSnippet', {
          allSettled: {
            ids: nonCachedIds,
            key: 'id',
          },
        });

        rawLambdaResponse.forEach((prom, index) => {
          if (prom.status === 'fulfilled') lambdaResponse.successful.push(prom.value);
          else lambdaResponse.failed.push(nonCachedIds[index]);
        });
      }

      const { successful, failed } = lambdaResponse;

      await this._redisCache.mset(successful.toObject('id', JSON.stringify));

      this._redisCache.mset(
        successful.toObject(
          val => this._transformer.encodeCacheKey(this._UserAccessLabel, response.locals.userId, val.id),
          val => val.id
        )
      );
      const result = [...successful, ...cachedHits].map(snippet => this._transformer.genericNodeConverter(snippet));

      response.status(statusCodes.OK).json({ successful: result, failed: failed });
    } catch (error) {
      next(error);
    }
  };

  getAllVersionsOfSnippets = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('getAllVersionsOfSnippet', {
        pathParameters: { id: request.params.snippetId },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllSnippetsOfWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const getData = request.query.getData === 'true';
      const result = await response.locals.invoker('getAllSnippetsOfWorkspace', {
        queryStringParameters: { getData: getData },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  makeSnippetPublic = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const snippetId = request.params.id;
      const version = request.params.version;

      await response.locals.invoker('makeSnippetPublic', {
        pathParameters: { id: snippetId, version: version },
      });
      this._redisCache.set(
        this._transformer.encodeCacheKey(this._PublicSnippetMockWorkspace, request.params.id),
        snippetId
      );

      response.status(statusCodes.OK).send();
    } catch (error) {
      next(error);
    }
  };
  makeSnippetPrivate = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const snippetId = request.params.id;
      const version = request.params.version;

      await response.locals.invoker('makeSnippetPrivate', {
        pathParameters: { id: snippetId, version: version },
      });

      this._redisCache.del(this._transformer.encodeCacheKey(this._PublicSnippetMockWorkspace, snippetId));
      response.status(statusCodes.OK).send();
    } catch (error) {
      next(error);
    }
  };

  getPublicSnippet = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const snippetId = request.params.snippetId;
      const version = request.params.version;

      const result = await this._redisCache.getOrSet<NodeResponse>(
        {
          key: snippetId,
          //Force get if user permission is not cached
          force: !this._redisCache.has(this._transformer.encodeCacheKey(this._PublicSnippetMockWorkspace, snippetId)),
        },
        () =>
          response.locals.invoker('getPublicSnippet', {
            pathParameters: { id: snippetId, version: version },
          })
      );

      const convertedResponse = this._transformer.genericNodeConverter(result);

      response.status(statusCodes.OK).json(convertedResponse);
    } catch (error) {
      next(error);
    }
  };

  clonePublicSnippet = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const snippetId = request.params.id;
      const version = request.params.version;

      const result = await response.locals.invoker('clonePublicSnippet', {
        pathParameters: { id: snippetId, version: version },
      });

      response.json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteVersionOfSnippet = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const snippetID = request.params.id;

      // If a version is not passed in query parameters, it deletes the latest version
      const version = request.query['version'] ? parseInt(request.query['version'] as string) : undefined;

      await response.locals.invoker('deleteVersionOfSnippet', {
        pathParameters: { id: snippetID },
        ...(version && { queryStringParameters: { version: version } }),
      });
      await response.locals.broadcaster({
        operationType: 'DELETE',
        entityType: 'SNIPPET',
        entityId: snippetID,
      });
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  deleteAllVersionsOfSnippet = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const snippetID = request.params.id;

      await response.locals.invoker('deleteAllVersionsOfSnippet', {
        pathParameters: { id: snippetID },
      });
      await response.locals.broadcaster({
        operationType: 'DELETE',
        entityType: 'SNIPPET',
        entityId: snippetID,
      });
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  updateSnippetMetadata = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'UpdateMetadata').data;

      await response.locals.invoker('updateSnippetMetadata', {
        pathParameters: { id: request.params.id },
        payload: { ...body, type: 'MetadataRequest' },
      });
      await response.locals.broadcaster({
        operationType: 'UPDATE',
        entityType: 'SNIPPET',
        entityId: request.params.id,
      });
      this._redisCache.del(request.params.id);
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

export default SnippetController;
