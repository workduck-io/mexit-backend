import express, { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../libs/statusCodes';
import { initializeBookmarkRoutes } from '../routes/BookmarkRoutes';

class BookmarkController {
  public _urlPath = '/userStar';
  public _router = express.Router();

  constructor() {
    initializeBookmarkRoutes(this);
  }

  getBookmarksForUser = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('getAllBookmarks');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createBookmark = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await response.locals.invoker('createBookmark', {
        pathParameters: { id: request.params.nodeID },
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  removeBookmark = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await response.locals.invoker('removeBookmark', {
        pathParameters: { id: request.params.nodeID },
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  batchCreateBookmarks = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await response.locals.invoker('batchCreateBookmark', {
        payload: request.body,
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  batchRemoveBookmarks = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await response.locals.invoker('batchRemoveBookmark', {
        payload: request.body,
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

export default BookmarkController;
