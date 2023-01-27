import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { CommentManager } from '../managers/CommentManager';
import { initializeCommentRoutes } from '../routes/CommentRoutes';

class CommentController {
  public _urlPath = '/comment';
  public _router = express.Router();

  private _commentManager: CommentManager =
    container.get<CommentManager>(CommentManager);
  private _transformer: Transformer = container.get<Transformer>(Transformer);
  private _cache: Redis = container.get<Redis>(Redis);
  private _UserAccessLabel = 'USERACCESS';
  private _CommentBlockLabel = 'COMMENTBLOCK';

  constructor() {
    initializeCommentRoutes(this);
  }

  getComment = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._commentManager.getCommentByID(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID,
        request.params.entityID
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
      const result = await this._commentManager.createComment(
        response.locals.workspaceID,
        response.locals.idToken,
        data
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
      await this._commentManager.deleteCommentByID(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID,
        request.params.entityID
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
      const result = await this._commentManager.getAllCommentsOfNode(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID
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
          this._commentManager.getAllCommentsOfBlock(
            response.locals.workspaceID,
            response.locals.idToken,
            request.params.nodeID,
            request.params.blockID
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

      const managerResponse = !nonCachedIds.isEmpty()
        ? await this._commentManager.getAllCommentsOfBlocks(
            response.locals.workspaceID,
            response.locals.idToken,
            request.params.nodeID,
            cachedUserAccess ? nonCachedIds : ids
          )
        : { successful: [], failed: [] };

      await this._cache.mset(
        managerResponse.successful.toObject(
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
              failed: managerResponse.failed,
              successful: [...managerResponse.successful, ...cachedHits],
            }
          : managerResponse
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
      const result = await this._commentManager.getAllCommentsOfThread(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID,
        request.params.blockID,
        request.params.threadID
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
      const result = await this._commentManager.deleteAllCommentsOfNode(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID
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
      const result = await this._commentManager.deleteAllCommentsOfBlock(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID,
        request.params.blockID
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
      const result = await this._commentManager.deleteAllCommentsOfThread(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID,
        request.params.blockID,
        request.params.threadID
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default CommentController;
