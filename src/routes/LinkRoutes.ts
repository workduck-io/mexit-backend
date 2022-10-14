import { AuthRequest } from '../middlewares/authrequest';
import LinkController from '../controllers/LinkController';

export const initializeLinkRoutes = (linkObject: LinkController): void => {
  linkObject._router.get(
    `${linkObject._urlPath}/:workspaceId`,
    [AuthRequest],
    linkObject.getShortsByWorkspace
  );
};
