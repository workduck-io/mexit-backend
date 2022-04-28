import { AuthRequest } from '../middlewares/authrequest';
import SearchController from '../controllers/SearchController';

export const initializeSearchRoutes = (
  searchObject: SearchController
): void => {
  searchObject._router.get(
    searchObject._urlPath,
    [AuthRequest],
    searchObject.searchIndex
  );
};
