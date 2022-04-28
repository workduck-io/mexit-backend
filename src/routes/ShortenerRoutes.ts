import { AuthRequest } from '../middlewares/authrequest';
import ShortenerController from '../controllers/ShortenerController';

export const initializeShortenerRoutes = (
  shortenerObject: ShortenerController
): void => {
  shortenerObject._router.get(
    `${shortenerObject._urlPath}/:workspaceId`,
    [AuthRequest],
    shortenerObject.getShortsByWorkspace
  );
};
