import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { CommentManager } from '../managers/CommentManager';
import { initializeCommentRoutes } from '../routes/CommentRoutes';

class CommentController {
  public _urlPath = '/comment';
  public _router = express.Router();

  public _commentManager: CommentManager =
    container.get<CommentManager>(CommentManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);

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
        request.params.entityID
      );

      response.status(statusCodes.NO_CONTENT);
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
      const result = await this._commentManager.getAllCommentsOfBlock(
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

      response.status(statusCodes.OK).json(result);
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
