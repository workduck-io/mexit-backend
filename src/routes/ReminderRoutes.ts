import { AuthRequest } from '../middlewares/authrequest';
import ReminderController from '../controllers/ReminderController';

export const initializeReminderRoutes = (
  reminderObject: ReminderController
): void => {
  reminderObject._router.post(
    `${reminderObject._urlPath}`,
    [AuthRequest],
    reminderObject.createReminder
  );

  reminderObject._router.get(
    `${reminderObject._urlPath}/workspace`,
    [AuthRequest],
    reminderObject.getAllRemindersOfWorkspace
  );

  reminderObject._router.get(
    `${reminderObject._urlPath}/node/:nodeID`,
    [AuthRequest],
    reminderObject.getAllRemindersOfNode
  );

  reminderObject._router.get(
    `${reminderObject._urlPath}/:entityID`,
    [AuthRequest],
    reminderObject.getReminder
  );

  reminderObject._router.delete(
    `${reminderObject._urlPath}/node/:nodeID`,
    [AuthRequest],
    reminderObject.deleteAllRemindersOfNode
  );

  reminderObject._router.delete(
    `${reminderObject._urlPath}/:entityID`,
    [AuthRequest],
    reminderObject.deleteReminder
  );
};
