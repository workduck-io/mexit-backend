import express, { NextFunction, Request, Response } from 'express';

import { STAGE } from '../env';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { initializePublicRoutes } from '../routes/PublicRoutes';

class PublicController {
  public _urlPath = '/public';
  public _router = express.Router();

  private _transformer: Transformer = container.get<Transformer>(Transformer);
  private _cache: Redis = container.get<Redis>(Redis);
  private _nsLambdaFunctionName = `mex-backend-${STAGE}-Namespace:latest`;
  private _nodeLambdaFunctionName = `mex-backend-${STAGE}-Node:latest`;

  constructor() {
    initializePublicRoutes(this);
  }

  getPublicNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const nodeId = request.params.nodeId;
      const result = await this._cache.getOrSet(
        {
          key: nodeId,
        },
        () =>
          response.locals.lambdaInvoker(this._nodeLambdaFunctionName, 'getPublicNode', {
            pathParameters: { id: nodeId },
          })
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getPublicNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const namespaceID = request.params.namespaceID;
      const publicNS = await this._cache.getOrSet(
        {
          key: namespaceID,
        },
        () =>
          response.locals.lambdaInvoker(this._nsLambdaFunctionName, 'getPublicNamespace', {
            pathParameters: { id: request.params.namespaceID },
          })
      );
      const parsedNS = this._transformer.namespaceHierarchyParser(publicNS);
      response.status(statusCodes.OK).json(parsedNS);
    } catch (error) {
      next(error);
    }
  };
}

export default PublicController;
