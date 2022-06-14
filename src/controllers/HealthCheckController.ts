import express, { Request, Response, NextFunction } from 'express';

import { statusCodes } from '../libs/statusCodes';

class HealthCheckController {
  public _urlPath = '/ping';
  public _router = express.Router();

  constructor() {
    this._router.get(this._urlPath, [], this.ping);
  }

  ping = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      response.status(statusCodes.OK).json({ ping: 'pong' });
    } catch (error) {
      next(error);
    }
  };
}

export default HealthCheckController;
