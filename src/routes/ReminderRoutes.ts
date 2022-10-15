import { AuthRequest } from '../middlewares/authrequest';
import ReminderController from '../controllers/ReminderController';

export const initializeViewRoutes = (
  reminderObject: ReminderController
): void => {
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
