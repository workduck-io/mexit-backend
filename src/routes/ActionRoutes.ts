import ActionController from '../controllers/ActionController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeActionRoutes = (actionObject: ActionController): void => {
  actionObject._router.get(`${actionObject._urlPath}/:groupId/action/:actionId`, [AuthRequest], actionObject.getAction);

  actionObject._router.get(`${actionObject._urlPath}/:groupId`, [AuthRequest], actionObject.getAllActions);

  actionObject._router.get(`${actionObject._urlPath}/auth/refresh/:source`, [AuthRequest], actionObject.refreshAuth);
  actionObject._router.get(`${actionObject._urlPath}/auth/:authId`, [AuthRequest], actionObject.getAuth);

  actionObject._router.put(`${actionObject._urlPath}/auth/:authId`, [AuthRequest], actionObject.getAllAuth);
};
