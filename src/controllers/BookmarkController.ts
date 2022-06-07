import express, { Request, Response } from 'express';
import { BookmarkManager } from '../managers/BookmarkManager';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { initializeBookmarkRoutes } from '../routes/BookmarkRoutes';

class BookmarkController {
  public _urlPath = '/bookmark';
  public _router = express.Router();
  public _bookmarkManager: BookmarkManager =
    container.get<BookmarkManager>(BookmarkManager);

  constructor() {
    initializeBookmarkRoutes(this);
  }

  getBookmarksForUser = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const result = await this._bookmarkManager.getAllBookmarksForUser(
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
      const parsedResult = JSON.parse(result.body);

      response.status(statusCodes.OK).json(parsedResult);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.toString() });
    }
  };

  createBookmark = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const nodeID = request.params.nodeid;
      await this._bookmarkManager.createBookmark(
        nodeID,
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );
      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  removeBookmark = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const nodeID = request.params.nodeid;

      await this._bookmarkManager.removeBookmark(
        nodeID,
        response.locals.userId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };
}

export default BookmarkController;
