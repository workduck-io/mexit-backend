import BookmarkController from '../controllers/BookmarkController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeBookmarkRoutes = (
  bookmarkControllerObject: BookmarkController
): void => {
  bookmarkControllerObject._router.patch(
    `${bookmarkControllerObject._urlPath}/:nodeid`,
    [AuthRequest],
    bookmarkControllerObject.createBookmark
  );

  bookmarkControllerObject._router.delete(
    `${bookmarkControllerObject._urlPath}/:nodeid`,
    [AuthRequest],
    bookmarkControllerObject.removeBookmark
  );

  bookmarkControllerObject._router.get(
    `${bookmarkControllerObject._urlPath}`,
    [AuthRequest],
    bookmarkControllerObject.getBookmarksForUser
  );
};
