import BroadcastController from '../controllers/BroadcastController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeBroadcastRoutes = (broadcastObject: BroadcastController): void => {
  broadcastObject._router.get(`${broadcastObject._urlPath}/`, [AuthRequest], broadcastObject.fetchEvents);
  broadcastObject._router.get(`${broadcastObject._fileUrlPath}/`, [AuthRequest], broadcastObject.fetchLatestFileInfo);
  broadcastObject._router.post(`${broadcastObject._fileUrlPath}/`, [AuthRequest], broadcastObject.saveLatestFileInfo);
};
