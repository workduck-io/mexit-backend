import NodeController from '../controllers/NodeController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeNodeRoutes = (
  nodeControllerObject: NodeController
): void => {
  nodeControllerObject._router.post(
    nodeControllerObject._urlPath,
    [AuthRequest],
    nodeControllerObject.createNode
  );

  nodeControllerObject._router.get(
    `${nodeControllerObject._urlPath}/:nodeId`,
    [AuthRequest],
    nodeControllerObject.getNode
  );

  nodeControllerObject._router.put(
    `${nodeControllerObject._urlPath}/:nodeId`,
    [AuthRequest],
    nodeControllerObject.appendNode
  );

  nodeControllerObject._router.post(
    `${nodeControllerObject._urlPath}/refactor`,
    [AuthRequest],
    nodeControllerObject.refactorHierarchy
  );

  nodeControllerObject._router.post(
    `${nodeControllerObject._urlPath}/bulkCreate`,
    [AuthRequest],
    nodeControllerObject.bulkCreateNode
  );

  nodeControllerObject._router.post(
    `${nodeControllerObject._urlPath}/block/movement`,
    [AuthRequest],
    nodeControllerObject.copyOrMoveBlock
  );

  nodeControllerObject._router.patch(
    `${nodeControllerObject._urlPath}/:id/makePublic`,
    [AuthRequest],
    nodeControllerObject.makeNodePublic
  );

  nodeControllerObject._router.patch(
    `${nodeControllerObject._urlPath}/:id/makePrivate`,
    [AuthRequest],
    nodeControllerObject.makeNodePrivate
  );

  nodeControllerObject._router.get(
    `${nodeControllerObject._urlPath}/archive`,
    [AuthRequest],
    nodeControllerObject.getArchivedNodes
  );

  nodeControllerObject._router.put(
    `${nodeControllerObject._urlPath}/archive/:namespaceID`,
    [AuthRequest],
    nodeControllerObject.archiveNode
  );

  nodeControllerObject._router.put(
    `${nodeControllerObject._urlPath}/unarchive`,
    [AuthRequest],
    nodeControllerObject.unArchiveNode
  );

  nodeControllerObject._router.post(
    `${nodeControllerObject._urlPath}/archive/delete`,
    [AuthRequest],
    nodeControllerObject.deleteArchivedNode
  );

  return;
};
