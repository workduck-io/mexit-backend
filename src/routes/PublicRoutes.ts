import PublicController from '../controllers/PublicController';

export const initializePublicRoutes = (
  publicControllerObject: PublicController
): void => {
  publicControllerObject._router.get(
    `${publicControllerObject._urlPath}/:nodeId`,
    [],
    publicControllerObject.getPublicNode
  );
  return;
};
