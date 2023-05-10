import SmartCaptureController from '../controllers/SmartCaptureController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeSmartCaptureRoutes = (smartCaptureObject: SmartCaptureController): void => {
  smartCaptureObject._router.get(
    `${smartCaptureObject._urlPath}/all/public`,
    [AuthRequest],
    smartCaptureObject.getAllPublicConfigs
  );

  smartCaptureObject._router.post(`${smartCaptureObject._urlPath}/`, [AuthRequest], smartCaptureObject.createCapture);

  smartCaptureObject._router.put(`${smartCaptureObject._urlPath}/:id`, [AuthRequest], smartCaptureObject.updateCapture);

  smartCaptureObject._router.get(`${smartCaptureObject._urlPath}/:id`, [AuthRequest], smartCaptureObject.getCapture);

  smartCaptureObject._router.delete(
    `${smartCaptureObject._urlPath}/:id`,
    [AuthRequest],
    smartCaptureObject.deleteCapture
  );

  smartCaptureObject._router.get(
    `${smartCaptureObject._urlPath}/filter`,
    [AuthRequest],
    smartCaptureObject.filterAllCaptures
  );
};
