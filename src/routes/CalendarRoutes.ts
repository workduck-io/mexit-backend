import CalendarController from '../controllers/CalendarController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeCalendarRoutes = (calendarControllerObject: CalendarController): void => {
  calendarControllerObject._router.get(
    `${calendarControllerObject._urlPath}/providers`,
    [AuthRequest],
    calendarControllerObject.getAllCalendarConfigs
  );
  return;
};
