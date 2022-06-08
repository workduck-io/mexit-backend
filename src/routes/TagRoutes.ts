// import PublicController from '../controllers/PublicController';
// import { PublicRequest } from '../middlewares/publicrequest';

import TagController from '../controllers/TagController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeTagRoutes = (
  tagControllerObject: TagController
): void => {
  tagControllerObject._router.get(
    `${tagControllerObject._urlPath}/`,
    [AuthRequest],
    tagControllerObject.getAllTagsOfWorkspace
  );
  tagControllerObject._router.get(
    `${tagControllerObject._urlPath}/:tagName`,
    [AuthRequest],
    tagControllerObject.getNodesWithTag
  );
  return;
};
