import express, { NextFunction, Request, Response } from 'express';
import { STAGE } from '../env';
import container from '../inversify.config';
import { InvocationType } from '../libs/LambdaClass';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { initializeCommentRoutes } from '../routes/CommentRoutes';

class CommentController {
  public _urlPath = '/comment';
  public _router = express.Router();

  private _transformer: Transformer = container.get<Transformer>(Transformer);
  private _cache: Redis = container.get<Redis>(Redis);
  private _UserAccessLabel = 'USERACCESS';
  private _CommentBlockLabel = 'COMMENTBLOCK';

  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _commentLambdaName = `comment-${STAGE}-main`;

  constructor() {
    initializeCommentRoutes(this);
  }

  getComment = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._commentLambdaName,
        'getCommentByID',
        {
          pathParameters: {
            entityId: request.params.entityID,
            nodeId: request.params.nodeId,
          },
        }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createComment = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = new RequestClass(request, 'Comment').data;
      this._cache.del(
        this._transformer.encodeCacheKey(this._CommentBlockLabel, data.blockId)
      );
      const result = await response.locals.invoker(
        this._commentLambdaName,
        'createComment',
        { payload: data }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await response.locals.invoker(
        this._commentLambdaName,
        'deleteCommentByID',
        {
          pathParameters: {
            entityId: request.params.entityID,
            nodeId: request.params.nodeID,
          },
        }
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getAllCommentsOfNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._commentLambdaName,
        'getAllCommentsOfNode',
        {
          pathParameters: { nodeId: request.params.nodeID },
        }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllCommentsOfBlock = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userSpecificNodeKey = this._transformer.encodeCacheKey(
        this._UserAccessLabel,
        response.locals.userId,
        request.params.nodeID
      );
      const result = await this._cache.getOrSet(
        {
          key: this._transformer.encodeCacheKey(
            this._CommentBlockLabel,
            request.params.blockID
          ),
          force: !this._cache.has(userSpecificNodeKey),
        },
        () =>
          response.locals.invoker(
            this._commentLambdaName,
            'getAllCommentsOfBlock',
            {
              pathParameters: {
                nodeId: request.params.nodeID,
                blockId: request.params.blockID,
              },
            }
          )
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllCommentsOfBlocks = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'GetMultipleIds');
      const ids = requestDetail.data.ids;
      const cachedUserAccess = await this._cache.get(
        this._transformer.encodeCacheKey(
          this._UserAccessLabel,
          response.locals.userId,
          request.params.nodeID
        )
      );
      const cachedHits = (
        await this._cache.mget(
          ids.map(id =>
            this._transformer.encodeCacheKey(this._CommentBlockLabel, id)
          )
        )
      )
        .filterEmpty()
        .map(hits => JSON.parse(hits));

      const nonCachedIds = ids.minus(cachedHits.map(item => item.blockId));

      const lambdaResponse = !nonCachedIds.isEmpty()
        ? await response.locals.invoker(
            this._commentLambdaName,
            'getAllCommentsOfBlock',
            {
              pathParameters: { nodeId: request.params.nodeID },
              allSettled: {
                ids: cachedUserAccess ? nonCachedIds : ids,
                key: 'blockId',
              },
            }
          )
        : { successful: [], failed: [] };

      await this._cache.mset(
        lambdaResponse.successful.toObject(
          item =>
            this._transformer.encodeCacheKey(
              this._CommentBlockLabel,
              item.blockId
            ),
          JSON.stringify
        )
      );

      response.status(statusCodes.OK).json(
        cachedUserAccess
          ? {
              failed: lambdaResponse.failed,
              successful: [...lambdaResponse.successful, ...cachedHits],
            }
          : lambdaResponse
      );
    } catch (error) {
      next(error);
    }
  };

  getAllCommentsOfThread = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._commentLambdaName,
        'getAllCommentsOfThread',
        {
          pathParameters: {
            nodeId: request.params.nodeID,
            blockId: request.params.blockID,
            threadId: request.params.threadID,
          },
        }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteAllCommentsOfNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._commentLambdaName,
        'deleteAllCommentsOfNode',
        {
          pathParameters: {
            nodeId: request.params.nodeID,
          },
        }
      );

      response.status(statusCodes.NO_CONTENT).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteAllCommentsOfBlock = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      this._cache.del(
        this._transformer.encodeCacheKey(
          this._CommentBlockLabel,
          request.params.blockID
        )
      );
      const result = await response.locals.invoker(
        this._commentLambdaName,
        'deleteAllCommentsOfBlock',
        {
          pathParameters: {
            nodeId: request.params.nodeID,
            blockId: request.params.blockID,
          },
        }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteAllCommentsOfThread = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._commentLambdaName,
        'deleteAllCommentsOfThread',
        {
          pathParameters: {
            nodeId: request.params.nodeID,
            blockId: request.params.blockID,
            threadId: request.params.threadID,
          },
        }
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default CommentController;
