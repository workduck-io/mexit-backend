import BroadcastController from '../controllers/BroadcastController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeBroadcastRoutes = (broadcastObject: BroadcastController): void => {
  broadcastObject._router.get(`${broadcastObject._urlPath}/event`, [AuthRequest], broadcastObject.fetchEvents);
  broadcastObject._router.get(`${broadcastObject._urlPath}/file`, [AuthRequest], broadcastObject.fetchLatestFileInfo);
  broadcastObject._router.post(`${broadcastObject._urlPath}/file`, [AuthRequest], broadcastObject.saveLatestFileInfo);
};
