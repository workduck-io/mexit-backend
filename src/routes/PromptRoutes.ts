import PromptController from '../controllers/PromptController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializePromptRoutes = (
  promptControllerObject: PromptController
): void => {
  promptControllerObject._router.get(
    `${promptControllerObject._urlPath}/all`,
    [AuthRequest],
    promptControllerObject.getAllPrompts
  );

  promptControllerObject._router.get(
    `${promptControllerObject._urlPath}/userAuth`,
    [AuthRequest],
    promptControllerObject.getUserAuthInfo
  );

  promptControllerObject._router.post(
    `${promptControllerObject._urlPath}/userAuth`,
    [AuthRequest],
    promptControllerObject.updateUserAuthInfo
  );

  promptControllerObject._router.get(
    `${promptControllerObject._urlPath}/providers`,
    [AuthRequest],
    promptControllerObject.getAllPromptProviders
  );

  promptControllerObject._router.post(
    `${promptControllerObject._urlPath}/:promptID`,
    [AuthRequest],
    promptControllerObject.generatePromptResult
  );
  return;
};
