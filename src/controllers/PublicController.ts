import express, { NextFunction, Request, Response } from 'express';

import { NodeResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { NamespaceManager } from '../managers/NamespaceManager';
import { NodeManager } from '../managers/NodeManager';
import { initializePublicRoutes } from '../routes/PublicRoutes';

class PublicController {
  public _urlPath = '/public';
  public _router = express.Router();
  public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);
  public _nsManager: NamespaceManager =
    container.get<NamespaceManager>(NamespaceManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    initializePublicRoutes(this);
  }

  getPublicNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const nodeId = request.params.nodeId;
      const idToken = request.headers.authorization;
      const result = (await this._nodeManager.getPublicNode(
        nodeId,
        idToken
      )) as NodeResponse;
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getPublicNamespace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const publicNamespace = await this._nsManager.getPublicNamespace(
        request.headers.authorization,
        request.params.namespaceID
      );

      const parsedPublicNS =
        this._transformer.namespaceHierarchyParser(publicNamespace);
      response.status(statusCodes.OK).json(parsedPublicNS);
    } catch (error) {
      next(error);
    }
  };
}

export default PublicController;
