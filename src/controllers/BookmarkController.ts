import express, { NextFunction, Request, Response } from 'express';
import { STAGE } from '../env';
import { statusCodes } from '../libs/statusCodes';
import { initializeBookmarkRoutes } from '../routes/BookmarkRoutes';

class BookmarkController {
  public _urlPath = '/userStar';
  public _router = express.Router();

  private _userStarLambdaFunctionName = `mex-backend-${STAGE}-UserStar`;

  constructor() {
    initializeBookmarkRoutes(this);
  }

  getBookmarksForUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._userStarLambdaFunctionName,
        'getAllBookmarks'
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createBookmark = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await response.locals.invoker(
        this._userStarLambdaFunctionName,
        'createBookmark',
        { pathParameters: { id: request.params.nodeID } }
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  removeBookmark = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await response.locals.invoker(
        this._userStarLambdaFunctionName,
        'removeBookmark',
        { pathParameters: { id: request.params.nodeID } }
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  batchCreateBookmarks = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await response.locals.invoker(
        this._userStarLambdaFunctionName,
        'batchCreateBookmark',
        {
          payload: request.body,
        }
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  batchRemoveBookmarks = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await response.locals.invoker(
        this._userStarLambdaFunctionName,
        'batchRemoveBookmark',
        { payload: request.body }
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

export default BookmarkController;
