import BroadcastController from '../controllers/BroadcastController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeBroadcastRoutes = (broadcastObject: BroadcastController): void => {
  broadcastObject._router.post(`${broadcastObject._urlPath}/`, [AuthRequest], broadcastObject.fetchEvents);
};
