import SharedController from '../controllers/SharedController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeSharedRoutes = (
  sharedControllerObject: SharedController
): void => {
  sharedControllerObject._router.post(
    `${sharedControllerObject._urlPath}/shared/update`,
    [AuthRequest],
    sharedControllerObject.updateSharedNode
  );
  sharedControllerObject._router.get(
    `${sharedControllerObject._urlPath}/shared/:nodeId/users`,
    [AuthRequest],
    sharedControllerObject.getUserWithNodesShared
  );
  sharedControllerObject._router.post(
    `${sharedControllerObject._urlPath}/shared`,
    [AuthRequest],
    sharedControllerObject.shareNode
  );
  sharedControllerObject._router.put(
    `${sharedControllerObject._urlPath}/shared`,
    [AuthRequest],
    sharedControllerObject.updateAccessTypeForSharedNode
  );
  sharedControllerObject._router.delete(
    `${sharedControllerObject._urlPath}/shared`,
    [AuthRequest],
    sharedControllerObject.revokeNodeAccessForUsers
  );
  sharedControllerObject._router.get(
    `${sharedControllerObject._urlPath}/shared/:nodeId`,
    [AuthRequest],
    sharedControllerObject.getNodeSharedWithUser
  );
  sharedControllerObject._router.get(
    `${sharedControllerObject._urlPath}/shared/all`,
    [AuthRequest],
    sharedControllerObject.getAllNodesSharedForUser
  );
  return;
};
