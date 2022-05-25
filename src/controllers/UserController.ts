import express, { Request, Response } from 'express';
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

  updateUser = async (request: Request, response: Response): Promise<any> => {
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
      response.json(JSON.parse(result));
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };
  get = async (request: Request, response: Response): Promise<any> => {
    try {
      const result = await this._userManager.get(response.locals.idToken);
      response.json(JSON.parse(result));
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };
  getById = async (request: Request, response: Response): Promise<any> => {
    try {
      const result = await this._userManager.getById(request.params.id);
      response.json(JSON.parse(result));
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };
  getByGroupId = async (request: Request, response: Response): Promise<any> => {
    try {
      const result = await this._userManager.getByGroupId(
        request.params.groupId
      );
      response.json(JSON.parse(result));
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };
  getUserByLinkedin = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      request.body.linkedinURL = request.body.linkedinURL.replace(/\/+$/, '');
      const result = JSON.parse(
        await this._userManager.getUserByLinkedin(request.body)
      );

      response.json({
        mex_user: result.length > 0 ? true : false,
      });
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };

  registerUser = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'RegisterUserRequest');
      const idToken = response.locals.idToken;

      const registerResp = JSON.parse(
        (await this._userManager.registerUser(idToken, requestDetail.data)).body
      );

      const initWorkspaceResp = JSON.parse(
        (
          await this._userManager.initializeWorkspace({
            workspaceID: registerResp.id,
            userEmail: requestDetail.data.user.email,
          })
        ).body
      );

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
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.toString() });
    }
  };
}

export default UserController;
