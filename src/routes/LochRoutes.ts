import LochController from '../controllers/LochController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeLochRoutes = (lochControllerObject: LochController): void => {
  lochControllerObject._router.get(
    `${lochControllerObject._urlPath}/all`,
    [AuthRequest],
    lochControllerObject.getAllServices
  );
  lochControllerObject._router.get(
    `${lochControllerObject._urlPath}/`,
    [AuthRequest],
    lochControllerObject.getConnectedServives
  );

  lochControllerObject._router.post(
    `${lochControllerObject._urlPath}/`,
    [AuthRequest],
    lochControllerObject.connectToService
  );
  lochControllerObject._router.put(
    `${lochControllerObject._urlPath}/`,
    [AuthRequest],
    lochControllerObject.updateParentNodeOfConnectedService
  );
  return;
};
