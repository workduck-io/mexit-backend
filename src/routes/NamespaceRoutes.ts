import NamespaceController from '../controllers/NamespaceController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeNamespaceRoutes = (nsObject: NamespaceController): void => {
  nsObject._router.post(`${nsObject._urlPath}/`, [AuthRequest], nsObject.createNamespace);

  nsObject._router.get(`${nsObject._urlPath}/all`, [AuthRequest], nsObject.getAllNamespaces);

  nsObject._router.post(`${nsObject._urlPath}/delete/:namespaceID`, [AuthRequest], nsObject.deleteNamespace);

  nsObject._router.post(`${nsObject._urlPath}/share`, [AuthRequest], nsObject.shareNamespace);
  nsObject._router.delete(`${nsObject._urlPath}/share`, [AuthRequest], nsObject.revokeAccessFromNamespace);

  nsObject._router.get(
    `${nsObject._urlPath}/shared/:namespaceID/users`,
    [AuthRequest],
    nsObject.getUsersInvitedToNamespace
  );

  nsObject._router.get(`${nsObject._urlPath}/:namespaceID/path/:path`, [AuthRequest], nsObject.getNodeIDFromPath);

  nsObject._router.get(`${nsObject._urlPath}/:namespaceID`, [AuthRequest], nsObject.getNamespace);

  nsObject._router.patch(`${nsObject._urlPath}/`, [AuthRequest], nsObject.updateNamespace);

  nsObject._router.patch(`${nsObject._urlPath}/makePublic/:namespaceID`, [AuthRequest], nsObject.makeNamespacePublic);

  nsObject._router.patch(`${nsObject._urlPath}/makePrivate/:namespaceID`, [AuthRequest], nsObject.makeNamespacePrivate);

  nsObject._router.get(`${nsObject._urlPath}/all/hierarchy`, [AuthRequest], nsObject.getAllNamespaceHierarchy);
};
