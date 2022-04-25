import express, { Request, Response } from 'express';
import { BookmarkManager } from '../managers/BookmarkManager';
import { AuthRequest } from '../middlewares/authrequest';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';

class BookmarkController {
  public _urlPath = '/bookmark';
  public _router = express.Router();
  public _bookmarkManager: BookmarkManager =
    container.get<BookmarkManager>(BookmarkManager);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.patch(
      `${this._urlPath}/:nodeid`,
      [AuthRequest],
      this.createBookmark
    );

    this._router.delete(
      `${this._urlPath}/:nodeid`,
      [AuthRequest],
      this.removeBookmark
    );

    this._router.get(
      `${this._urlPath}`,
      [AuthRequest],
      this.getBookmarksForUser
    );
  }

  getBookmarksForUser = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();
      const result = await this._bookmarkManager.getAllBookmarksForUser(
        response.locals.userId,
        workspaceId,
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
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const nodeID = request.params.nodeid;
      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._bookmarkManager.createBookmark(
        nodeID,
        response.locals.userId,
        workspaceId,
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
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const nodeID = request.params.nodeid;
      const workspaceId = request.headers['mex-workspace-id'].toString();

      const res = await this._bookmarkManager.removeBookmark(
        nodeID,
        response.locals.userId,
        workspaceId,
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
