import express, { Request, Response } from 'express';
import container from '../inversify.config';
import { WorkspaceManager } from '../managers/WorkspaceManager';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';

class WorkspaceController {
  public _urlPath = '/workspace';
  public _namespacePath = '/namespace';
  public _router = express.Router();
  public _workspaceManager: WorkspaceManager =
    container.get<WorkspaceManager>(WorkspaceManager);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.post(this._urlPath, this.createWorkspace);
    this._router.post(this._namespacePath, this.createNamespace);
    return;
  }

  createWorkspace = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'Workspace');
      const result = await this._workspaceManager.createWorkspace(
        requestDetail.data,
        requestDetail.authToken
      );
      response.status(result.status).send(result.data);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  createNamespace = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'Namespace');
      const result = await this._workspaceManager.createWorkspace(
        requestDetail.data,
        requestDetail.authToken
      );
      response.status(result.status).send(result.data);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
}

export default WorkspaceController;
