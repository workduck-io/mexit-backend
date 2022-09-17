import { AuthRequest } from '../middlewares/authrequest'
import { PublicRequest } from '../middlewares/publicrequest'
import NamespaceController from '../controllers/NamespaceController'

export const initializeNamespaceRoutes = (
  nsObject: NamespaceController
): void => {

  nsObject._router.post(
    `${nsObject._urlPath}/`,
    [AuthRequest],
    nsObject.createNamespace
  );

  nsObject._router.get(
    `${nsObject._urlPath}/:namespaceID`,
    [AuthRequest],
    nsObject.getNamespace
  );

  nsObject._router.patch(
    `${nsObject._urlPath}/`,
    [AuthRequest],
    nsObject.updateNamespace
  );

  nsObject._router.patch(
    `${nsObject._urlPath}/:namespaceID/makePublic`,
    [AuthRequest],
    nsObject.makeNamespacePublic
  );

  nsObject._router.patch(
    `${nsObject._urlPath}/:namespaceID/makePrivate`,
    [AuthRequest],
    nsObject.makeNamespacePrivate
  );

  nsObject._router.get(
    `${nsObject._urlPath}/public/:namespaceID`,
    [PublicRequest],
    nsObject.getPublicNamespace
  );

  nsObject._router.get(
    `${nsObject._urlPath}/all/hierarchy`,
    [AuthRequest],
    nsObject.getAllNamespaceHierarchy
  );

}
