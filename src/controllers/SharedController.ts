import express, { Request, Response } from 'express';
import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { SharedManager } from '../managers/SharedManager';
import { initializeSharedRoutes } from '../routes/SharedRoutes';

class SharedController {
  public _urlPath = '/node';
  public _router = express.Router();
  public _sharedManager: SharedManager =
    container.get<SharedManager>(SharedManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    initializeSharedRoutes(this);
  }

  shareNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ShareNodeDetail');
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._sharedManager.shareNode(
        workspaceId,
        response.locals.idToken,
        requestDetail.data
      );

      if (result) response.json(JSON.parse(result));
      else response.json({ message: 'No response' });
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  updateAccessTypeForSharedNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(
        request,
        'UpdateAccessTypeForSharedNodeDetail'
      );
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._sharedManager.updateAccessTypeForSharedNode(
        workspaceId,
        response.locals.idToken,
        requestDetail.data
      );

      if (result) response.json(JSON.parse(result));
      else response.json({ message: 'No response' });
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  revokeNodeAccessForUsers = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ShareNodeDetail');
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._sharedManager.revokeNodeAccessForUsers(
        workspaceId,
        response.locals.idToken,
        requestDetail.data
      );

      if (result) response.json(JSON.parse(result));
      else response.json({ message: 'No response' });
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  getNodeSharedWithUser = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const nodeId = request.params.nodeId;
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._sharedManager.getNodeSharedWithUser(
        workspaceId,
        response.locals.idToken,
        nodeId
      );

      if (result) response.json(JSON.parse(result));
      else response.json({ message: 'No response' });
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  updateSharedNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'NodeDetail');

      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._sharedManager.updateSharedNode(
        workspaceId,
        response.locals.idToken,
        requestDetail.data
      );

      if (result) response.json(JSON.parse(result));
      else response.json({ message: 'No response' });
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  getUserWithNodesShared = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const nodeId = request.params.nodeId;
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._sharedManager.getUserWithNodesShared(
        workspaceId,
        response.locals.idToken,
        nodeId
      );

      if (result) response.json(JSON.parse(result));
      else response.json({ message: 'No response' });
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  getAllNodesSharedForUser = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._sharedManager.getAllNodesSharedForUser(
        workspaceId,
        response.locals.idToken
      );

      if (result) response.json(JSON.parse(result));
      else response.json({ message: 'No response' });
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };
}

export default SharedController;
