import { AuthRequest } from '../middlewares/authrequest';
import UserController from '../controllers/UserController';

export const initializeUserRoutes = (userObject: UserController): void => {
  userObject._router.post(
    `${userObject._urlPath}/update`,
    [AuthRequest],
    userObject.updateUser
  );
  userObject._router.get(
    `${userObject._urlPath}`,
    [AuthRequest],
    userObject.get
  );
  userObject._router.get(
    `${userObject._urlPath}/:id`,
    [AuthRequest],
    userObject.getById
  );
  userObject._router.get(
    `${userObject._urlPath}/group/:groupId`,
    [AuthRequest],
    userObject.getByGroupId
  );
  userObject._router.post(
    `${userObject._urlPath}/linkedin`,
    [AuthRequest],
    userObject.getUserByLinkedin
  );
  userObject._router.post(
    `${userObject._urlPath}/register`,
    [AuthRequest],
    userObject.registerUser
  );
};
