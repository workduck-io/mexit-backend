import WorkspaceController from '../controllers/WorkspaceController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeWorkspaceRoutes = (workspaceObject: WorkspaceController): void => {
  workspaceObject._router.get(`${workspaceObject._urlPath}/all`, [AuthRequest], workspaceObject.getAllWorkspacesOfUser);

  workspaceObject._router.patch(`${workspaceObject._urlPath}/`, [AuthRequest], workspaceObject.updateWorkspace);
};
