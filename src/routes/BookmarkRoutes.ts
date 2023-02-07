import BookmarkController from '../controllers/BookmarkController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeBookmarkRoutes = (bookmarkControllerObject: BookmarkController): void => {
  bookmarkControllerObject._router.get(
    `${bookmarkControllerObject._urlPath}`,
    [AuthRequest],
    bookmarkControllerObject.getBookmarksForUser
  );

  bookmarkControllerObject._router.post(
    `${bookmarkControllerObject._urlPath}/batch`,
    [AuthRequest],
    bookmarkControllerObject.batchCreateBookmarks
  );

  bookmarkControllerObject._router.delete(
    `${bookmarkControllerObject._urlPath}/batch`,
    [AuthRequest],
    bookmarkControllerObject.batchRemoveBookmarks
  );

  bookmarkControllerObject._router.post(
    `${bookmarkControllerObject._urlPath}/:nodeID`,
    [AuthRequest],
    bookmarkControllerObject.createBookmark
  );

  bookmarkControllerObject._router.delete(
    `${bookmarkControllerObject._urlPath}/:nodeID`,
    [AuthRequest],
    bookmarkControllerObject.removeBookmark
  );
};
