import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { SharedManager } from '../managers/SharedManager';
import { initializeSharedRoutes } from '../routes/SharedRoutes';

class SharedController {
  public _urlPath = '/shared';
  public _router = express.Router();
  public _sharedManager: SharedManager =
    container.get<SharedManager>(SharedManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    initializeSharedRoutes(this);
  }

  shareNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ShareNodeDetail');

      const result = await this._sharedManager.shareNode(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateAccessTypeForSharedNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(
        request,
        'UpdateAccessTypeForSharedNodeDetail'
      );

      const result = await this._sharedManager.updateAccessTypeForSharedNode(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  revokeNodeAccessForUsers = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ShareNodeDetail');

      const result = await this._sharedManager.revokeNodeAccessForUsers(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getNodeSharedWithUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const nodeId = request.params.nodeId;

      const result = await this._sharedManager.getNodeSharedWithUser(
        response.locals.workspaceID,
        response.locals.idToken,
        nodeId
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateSharedNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'NodeDetail');

      const result = await this._sharedManager.updateSharedNode(
        response.locals.workspaceID,
        response.locals.idToken,
        requestDetail.data
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUserWithNodesShared = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const nodeId = request.params.nodeId;
      const result = await this._sharedManager.getUserWithNodesShared(
        response.locals.workspaceID,
        response.locals.idToken,
        nodeId
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllNodesSharedForUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._sharedManager.getAllNodesSharedForUser(
        response.locals.workspaceID,
        response.locals.idToken
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default SharedController;
