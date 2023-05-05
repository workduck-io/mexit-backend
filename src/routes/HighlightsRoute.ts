import HighlightController from '../controllers/HighlightController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeHighlightRoutes = (highlightObject: HighlightController): void => {
  highlightObject._router.post(`${highlightObject._urlPath}`, [AuthRequest], highlightObject.createHighlight);
  highlightObject._router.put(`${highlightObject._urlPath}/:id`, [AuthRequest], highlightObject.updateHighlight);

  highlightObject._router.get(
    `${highlightObject._urlPath}`,
    [AuthRequest],
    highlightObject.getAllHighlightsOfWorkspace
  );
  highlightObject._router.get(
    `${highlightObject._urlPath}/instances/all/:id`,
    [AuthRequest],
    highlightObject.getAllHighlightInstances
  );
  highlightObject._router.get(`${highlightObject._urlPath}/ids`, [AuthRequest], highlightObject.getMultipleHighlights);
  highlightObject._router.get(`${highlightObject._urlPath}/:id`, [AuthRequest], highlightObject.getHighlight);

  highlightObject._router.delete(`${highlightObject._urlPath}/:id`, [AuthRequest], highlightObject.deleteHighlight);
};
