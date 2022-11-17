import express, { NextFunction, Request, Response } from 'express';
import { CacheType } from '../interfaces/Config';
import container from '../inversify.config';
import { Cache } from '../libs/CacheClass';
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
  private _userAccessCache: Cache = container.get<Cache>(CacheType.UserAccess);
  private _userAccessTypeCache: Cache = container.get<Cache>(
    CacheType.UserAccessType
  );
  private _UserAccessLabel = 'USERACCESS';
  private _UserAccessTypeLabel = 'USERACCESSTYPE';

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
      requestDetail.data.userIDs.forEach(userID => {
        this._userAccessCache.set(
          userID + requestDetail.data.nodeID,
          this._UserAccessLabel,
          true
        );
      });
      this._userAccessTypeCache.del(
        requestDetail.data.nodeID,
        this._UserAccessTypeLabel
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
      Object.keys(requestDetail.data.userIDToAccessTypeMap).forEach(userID => {
        this._userAccessCache.set(
          userID + requestDetail.data.nodeID,
          this._UserAccessLabel,
          true
        );
      });
      this._userAccessTypeCache.del(
        requestDetail.data.nodeID,
        this._UserAccessTypeLabel
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
      const body = request.body;

      const result = await this._sharedManager.revokeNodeAccessForUsers(
        response.locals.workspaceID,
        response.locals.idToken,
        body
      );
      body.userIDs.forEach(userID => {
        this._userAccessCache.del(userID + body.nodeID, this._UserAccessLabel);
      });
      this._userAccessTypeCache.del(body.nodeID, this._UserAccessTypeLabel);
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
      const requestDetail = new RequestClass(request, 'UpdateShareNodeDetail');

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

      if (nodeId === '__null__') {
        response.status(statusCodes.BAD_REQUEST).send();
        return;
      }

      const managerResponse = await this._sharedManager.getUserWithNodesShared(
        response.locals.workspaceID,
        response.locals.idToken,
        nodeId
      );

      const result = this._userAccessTypeCache.getOrSet(
        nodeId,
        this._UserAccessTypeLabel,
        managerResponse
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

  getBulkSharedNodes = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = new RequestClass(request, 'GetMultipleNode').data;
      const result = await this._sharedManager.bulkGetSharedNodes(
        data.ids,
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
