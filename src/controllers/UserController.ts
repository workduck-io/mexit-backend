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
}

export default UserController;
