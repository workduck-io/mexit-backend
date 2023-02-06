import express, { NextFunction, Request, Response } from 'express';

import { STAGE } from '../env';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { initializePublicRoutes } from '../routes/PublicRoutes';

class PublicController {
  public _urlPath = '/public';
  public _router = express.Router();
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  private _nsLambdaFunctionName = `mex-backend-${STAGE}-Namespace`;
  private _nodeLambdaFunctionName = `mex-backend-${STAGE}-Node`;

  constructor() {
    initializePublicRoutes(this);
  }

  getPublicNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const nodeId = request.params.nodeId;
      const result = await response.locals.invoker(this._nodeLambdaFunctionName, 'getPublicNode', {
        pathParameters: { id: nodeId },
      });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getPublicNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const publicNamespace = await response.locals.invoker(this._nsLambdaFunctionName, 'getPublicNamespace', {
        pathParameters: { id: request.params.namespaceID },
      });

      const parsedPublicNS = this._transformer.namespaceHierarchyParser(publicNamespace);
      response.status(statusCodes.OK).json(parsedPublicNS);
    } catch (error) {
      next(error);
    }
  };
}

export default PublicController;
