import { AuthRequest } from '../middlewares/authrequest';
import ViewController from '../controllers/ViewController';

export const initializeViewRoutes = (viewObject: ViewController): void => {
  viewObject._router.get(
    `${viewObject._urlPath}/all/workspace`,
    [AuthRequest],
    viewObject.getAllViews
  );

  viewObject._router.get(
    `${viewObject._urlPath}/:viewID`,
    [AuthRequest],
    viewObject.getView
  );

  viewObject._router.post(
    `${viewObject._urlPath}`,
    [AuthRequest],
    viewObject.postView
  );

  viewObject._router.delete(
    `${viewObject._urlPath}/:viewID`,
    [AuthRequest],
    viewObject.deleteView
  );
};
