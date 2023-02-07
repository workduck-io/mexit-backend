import LinkController from '../controllers/LinkController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeLinkRoutes = (linkObject: LinkController): void => {
  linkObject._router.post(`${linkObject._urlPath}/shorten`, [AuthRequest], linkObject.shortenLink);

  linkObject._router.get(`${linkObject._urlPath}`, [AuthRequest], linkObject.getAllShortsOfWorkspace);

  linkObject._router.delete(`${linkObject._urlPath}/:url`, [AuthRequest], linkObject.deleteShort);

  linkObject._router.get(`${linkObject._urlPath}/:url`, [AuthRequest], linkObject.getStatsByURL);
};
