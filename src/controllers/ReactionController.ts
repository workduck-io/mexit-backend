import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { ReactionManager } from '../managers/ReactionManager';
import { initializeReactionRoutes } from '../routes/ReactionRoutes';

class ReactionController {
  public _urlPath = '/reaction';
  public _router = express.Router();
  public _reactionManager: ReactionManager =
    container.get<ReactionManager>(ReactionManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    initializeReactionRoutes(this);
  }

  getReactionsOfNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._reactionManager.getReactionsOfNode(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getReactionsOfBlock = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._reactionManager.getReactionsOfBlock(
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

  getReactionDetailsOfBlock = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._reactionManager.getReactionDetailsOfBlock(
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

  toggleReaction = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'Reaction');
      const result = await this._reactionManager.toggleReaction(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default ReactionController;
