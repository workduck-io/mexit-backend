import express, { NextFunction, Request, Response } from 'express';
import { BookmarkManager } from '../managers/BookmarkManager';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { initializeBookmarkRoutes } from '../routes/BookmarkRoutes';

class BookmarkController {
  public _urlPath = '/userStar';
  public _router = express.Router();
  public _bookmarkManager: BookmarkManager =
    container.get<BookmarkManager>(BookmarkManager);

  constructor() {
    initializeBookmarkRoutes(this);
  }

  getBookmarksForUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._bookmarkManager.getAllBookmarksForUser(
        response.locals.workspaceID,
        response.locals.idToken
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
      await this._bookmarkManager.createBookmark(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID
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
      await this._bookmarkManager.removeBookmark(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID
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
      await this._bookmarkManager.batchCreateBookmarks(
        response.locals.workspaceID,
        response.locals.idToken,
        request.body
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
      await this._bookmarkManager.batchRemoveBookmarks(
        response.locals.workspaceID,
        response.locals.idToken,
        request.body
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

export default BookmarkController;
