import express, { NextFunction, Request, Response } from 'express';

import { STAGE } from '../env';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeSmartCaptureRoutes } from '../routes/SmartCaptureRoutes';

class SmartCaptureController {
  public _urlPath = '/capture';
  public _router = express.Router();

  private _cache = container.get<Redis>(Redis);
  private _PublicCaptureLabel = 'PUBLICCAPTURE';
  private _smartCaptureLambdaName = `smartcapture-${STAGE}-config`;

  constructor() {
    initializeSmartCaptureRoutes(this);
  }

  getAllPublicConfigs = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._cache.getOrSet(
        {
          key: this._PublicCaptureLabel,
          expires: 24 * 60 * 60 * 60, // 24 hours
        },
        () => response.locals.invoker(this._smartCaptureLambdaName, 'getPublicCaptureConfig')
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default SmartCaptureController;
