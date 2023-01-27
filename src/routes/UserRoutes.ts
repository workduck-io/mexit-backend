import UserController from '../controllers/UserController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeUserRoutes = (userObject: UserController): void => {
  userObject._router.get(
    `${userObject._urlPath}/status`,
    [AuthRequest],
    userObject.registerStatus
  );

  userObject._router.get(
    `${userObject._urlPath}/email/:mail`,
    [AuthRequest],
    userObject.getByMail
  );

  userObject._router.get(
    `${userObject._urlPath}/`,
    [AuthRequest],
    userObject.get
  );

  userObject._router.get(
    `${userObject._urlPath}/invite`,
    [AuthRequest],
    userObject.getInvitesOfWorkspace
  );

  userObject._router.get(
    `${userObject._urlPath}/invite/:inviteId`,
    [AuthRequest],
    userObject.getInvite
  );

  userObject._router.delete(
    `${userObject._urlPath}/invite/:inviteId`,
    [AuthRequest],
    userObject.deleteInvite
  );

  userObject._router.post(
    `${userObject._urlPath}/invite`,
    [AuthRequest],
    userObject.createInvite
  );

  userObject._router.get(
    `${userObject._urlPath}/all`,
    [AuthRequest],
    userObject.getUsersOfWorkspace
  );

  userObject._router.put(
    `${userObject._urlPath}/info`,
    [AuthRequest],
    userObject.updateUser
  );

  userObject._router.put(
    `${userObject._urlPath}/preference`,
    [AuthRequest],
    userObject.updateUserPreference
  );

  userObject._router.post(
    `${userObject._urlPath}/linkedin`,
    [AuthRequest],
    userObject.getUserByLinkedin
  );

  userObject._router.get(
    `${userObject._urlPath}/:id`,
    [AuthRequest],
    userObject.getById
  );
};
