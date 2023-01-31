import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { UserManager } from '../managers/UserManager';
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
    const requestDetail = new RequestClass(request, 'User');
    requestDetail.data.id = userId;

    if (requestDetail.data.linkedinURL) {
      requestDetail.data.linkedinURL = requestDetail.data.linkedinURL.replace(
        /\/+$/,
        ''
      );
    }

    try {
      const result = await this._userManager.updateUserDetails(
        requestDetail.data,
        response.locals.workspaceID,
        response.locals.idToken
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateUserPreference = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const userId = response.locals.userIdRaw;
      const requestDetail = new RequestClass(request, 'UserPreference').data;
      requestDetail.id = userId;

      const result = await this._userManager.updateUserPreference(
        requestDetail,
        response.locals.workspaceID,
        response.locals.idToken
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

  getInvite = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const inviteId = request.params.inviteId;
      const result = await this._userManager.getInvite(inviteId);
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteInvite = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const inviteId = request.params.inviteId;
      await this._userManager.deleteInvite(
        response.locals.workspaceID,
        response.locals.idToken,
        inviteId
      );
      response.status(statusCodes.NO_CONTENT).json();
    } catch (error) {
      next(error);
    }
  };

  getInvitesOfWorkspace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const result = await this._userManager.getInvitesOfWorkspace(
        response.locals.workspaceID,
        response.locals.idToken
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createInvite = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const payload = new RequestClass(request, 'InviteProperties').data;
      const result = await this._userManager.createInvite(
        response.locals.workspaceID,
        response.locals.idToken,
        payload
      );
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
  getByMail = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const result = await this._userManager.getByMail(request.params.mail);
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
  getUsersOfWorkspace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const result = await this._userManager.getUsersOfWorkspace(
        response.locals.workspaceID,
        response.locals.idToken
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

  registerStatus = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const registerStatus = await this._userManager.registerStatus(
        response.locals.idToken
      );

      response.status(statusCodes.OK).send(registerStatus);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
