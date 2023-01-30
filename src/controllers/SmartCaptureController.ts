import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { Redis } from '../libs/RedisClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { SmartCaptureManager } from '../managers/SmartCaptureManager';
import { initializeSmartCaptureRoutes } from '../routes/SmartCaptureRoutes';

class SmartCaptureController {
  public _urlPath = '/capture';
  public _router = express.Router();
  private _smartCaptureManager: SmartCaptureManager =
    container.get<SmartCaptureManager>(SmartCaptureManager);
  private _cache = container.get<Redis>(Redis);
  private _PublicCaptureLabel = 'PUBLICCAPTURE';
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    initializeSmartCaptureRoutes(this);
  }

  getAllPublicConfigs = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._cache.getOrSet(
        {
          key: this._PublicCaptureLabel,
          expires: 24 * 60 * 60 * 60, // 24 hours
        },
        () =>
          this._smartCaptureManager.getPublicConfig(
            response.locals.workspaceID,
            response.locals.idToken
          )
      );
      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default SmartCaptureController;
