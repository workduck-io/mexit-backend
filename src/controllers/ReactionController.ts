import express, { NextFunction, Request, Response } from 'express';

import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { initializeReactionRoutes } from '../routes/ReactionRoutes';

class ReactionController {
  public _urlPath = '/reaction';
  public _router = express.Router();
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  private _additionalHeaders = { 'mex-api-ver': 'v2' };

  constructor() {
    initializeReactionRoutes(this);
  }

  getReactionsOfNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.lambdaInvoker('getAllReactionsOfNode', {
        pathParameters: { nodeId: request.params.nodeID },
        additionalHeaders: this._additionalHeaders,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getReactionsOfBlock = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.lambdaInvoker('getAllReactionsOfBlock', {
        pathParameters: {
          nodeId: request.params.nodeID,
          blockId: request.params.blockID,
        },
        additionalHeaders: this._additionalHeaders,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getReactionDetailsOfBlock = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.lambdaInvoker('getReactionDetailsOfBlock', {
        pathParameters: {
          nodeId: request.params.nodeID,
          blockId: request.params.blockID,
        },
        additionalHeaders: this._additionalHeaders,
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  toggleReaction = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const data = new RequestClass(request, 'Reaction').data;
      await response.locals.lambdaInvoker('toggleReaction', {
        payload: data,
        sendRawBody: true,
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}
export default ReactionController;
