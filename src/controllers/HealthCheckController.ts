import express, { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../libs/statusCodes';

class HealthCheckController {
  public _urlPath = '/ping';
  public _router = express.Router();

  constructor() {
    this._router.get(this._urlPath, [], this.ping);
    this._router.get(`${this._urlPath}/gateway`, [], this.pingGateway);
  }

  ping = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      response.status(statusCodes.OK).json({ ping: 'pong' });
    } catch (error) {
      next(error);
    }
  };

  pingGateway = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const res = await response.locals.gatewayInvoker('Ping');
      response.status(statusCodes.OK).json(res);
    } catch (error) {
      next(error);
    }
  };
}

export default HealthCheckController;
