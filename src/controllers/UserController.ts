/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from 'express';
import container from '../inversify.config';

import { AuthRequest } from '../middlewares/authrequest';
import { statusCodes } from '../libs/statusCodes';
import { UserManager } from '../managers/UserManager';
import { RequestClass } from '../libs/RequestClass';

class UserController {
  public _urlPath = '/user';
  public _router = express.Router();

  public _userManager: UserManager = container.get<UserManager>(UserManager);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.post(
      `${this._urlPath}/update`,
      [AuthRequest],
      this.updateUser
    );
    this._router.post(`${this._urlPath}`, [AuthRequest], this.createUser);
    this._router.get(
      `${this._urlPath}/:id/:tag`,
      [AuthRequest],
      this.getByIdAndTag
    );
    this._router.get(
      `${this._urlPath}/group/:groupId/:tag`,
      [AuthRequest],
      this.getByGroupIdAndTag
    );
  }

  updateUser = async (request: Request, response: Response): Promise<any> => {
    const requestDetail = new RequestClass(request, 'UserPreference');
    try {
      const result = await this._userManager.updateUserPreference(
        requestDetail.data
      );
      response.json(JSON.parse(result));
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  createUser = async (request: Request, response: Response): Promise<any> => {
    const requestDetail = new RequestClass(request, 'UserPreference');
    try {
      const result = await this._userManager.createUserPreference(
        requestDetail.data
      );
      response.json(JSON.parse(result));
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  getByIdAndTag = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const result = await this._userManager.getByIdAndTag(
        request.params.id,
        request.params.tag
      );
      response.json(JSON.parse(result));
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  getByGroupIdAndTag = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const result = await this._userManager.getByGroupIdAndTag(
        request.params.groupId,
        request.params.tag
      );
      response.json(JSON.parse(result));
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
}

export default UserController;
