import PublicController from '../controllers/PublicController';
import { PublicRequest } from '../middlewares/publicrequest';

export const initializePublicRoutes = (
  publicControllerObject: PublicController
): void => {
  publicControllerObject._router.get(
    `${publicControllerObject._urlPath}/namespace/:namespaceID`,
    [PublicRequest],
    publicControllerObject.getPublicNamespace
  );

  publicControllerObject._router.get(
    `${publicControllerObject._urlPath}/:nodeId`,
    [PublicRequest],
    publicControllerObject.getPublicNode
  );
  return;
};
