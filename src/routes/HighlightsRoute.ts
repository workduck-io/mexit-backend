import HighlightController from '../controllers/HighlightController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeHighlightRoutes = (highlightObject: HighlightController): void => {
  highlightObject._router.post(`${highlightObject._urlPath}`, [AuthRequest], highlightObject.createHighlight);

  highlightObject._router.get(
    `${highlightObject._urlPath}`,
    [AuthRequest],
    highlightObject.getAllHighlightsOfWorkspace
  );

  highlightObject._router.delete(
    `${highlightObject._urlPath}/:entityId`,
    [AuthRequest],
    highlightObject.deleteHighlight
  );

  highlightObject._router.get(
    `${highlightObject._urlPath}/multiple`,
    [AuthRequest],
    highlightObject.getMultipleHighlights
  );
};
