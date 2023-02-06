import SmartCaptureController from '../controllers/SmartCaptureController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeSmartCaptureRoutes = (smartCaptureObject: SmartCaptureController): void => {
  smartCaptureObject._router.get(
    `${smartCaptureObject._urlPath}/all/public`,
    [AuthRequest],
    smartCaptureObject.getAllPublicConfigs
  );
};
