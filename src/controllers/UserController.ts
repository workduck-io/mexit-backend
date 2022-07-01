import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { UserManager } from '../managers/UserManager';
import { RequestClass } from '../libs/RequestClass';
import { initializeUserRoutes } from '../routes/UserRoutes';
import { Transformer } from './../libs/TransformerClass';
class UserController {
  public _urlPath = '/user';
  public _router = express.Router();

  public _userManager: UserManager = container.get<UserManager>(UserManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    initializeUserRoutes(this);
  }

  updateUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    const userId = response.locals.userIdRaw;
    const requestDetail = new RequestClass(request, 'UserPreference');
    requestDetail.data.id = userId;
    if (!requestDetail.data.tag) requestDetail.data.tag = 'MEX';

    if (requestDetail.data.linkedinURL) {
      requestDetail.data.linkedinURL = requestDetail.data.linkedinURL.replace(
        /\/+$/,
        ''
      );
    }

    try {
      const result = await this._userManager.updateUserPreference(
        requestDetail.data
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
  get = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const result = await this._userManager.get(response.locals.idToken);
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
  getById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const result = await this._userManager.getById(request.params.id);
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
  getByGroupId = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const result = await this._userManager.getByGroupId(
        request.params.groupId
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
  getUserByLinkedin = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      request.body.linkedinURL = request.body.linkedinURL.replace(/\/+$/, '');
      const result = await this._userManager.getUserByLinkedin(request.body);

      response.status(statusCodes.OK).json({
        mex_user: result.length > 0 ? true : false,
      });
    } catch (error) {
      next(error);
    }
  };

  registerUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'RegisterUserRequest');
      const idToken = response.locals.idToken;

      const registerResp = await this._userManager.registerUser(
        idToken,
        requestDetail.data
      );

      const initWorkspaceResp = await this._userManager.initializeWorkspace({
        workspaceID: registerResp.id,
        userID: response.locals.userIdRaw,
      });

      const nodeHierarchyInfo = this._transformer.linkHierarchyParser(
        initWorkspaceResp.nodeHierarchy
      );

      response.status(statusCodes.OK).json({
        registrationInfo: registerResp,
        nodes: initWorkspaceResp.baseData.nodes,
        snippets: initWorkspaceResp.baseData.snippets,
        ilinks: nodeHierarchyInfo,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
