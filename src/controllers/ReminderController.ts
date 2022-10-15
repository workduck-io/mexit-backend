import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { RequestClass } from '../libs/RequestClass';
import { ReminderManager } from '../managers/ReminderManager';
import { initializeReminderRoutes } from '../routes/ReminderRoutes';

class ReminderController {
  public _urlPath = '/reminder';
  public _router = express.Router();

  public _reminderManager: ReminderManager =
    container.get<ReminderManager>(ReminderManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    initializeReminderRoutes(this);
  }

  getReminder = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._reminderManager.getReminderByID(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.entityID
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createReminder = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = new RequestClass(request, 'Reminder').data;
      const result = await this._reminderManager.createReminder(
        response.locals.workspaceID,
        response.locals.idToken,
        data
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteReminder = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._reminderManager.deleteReminderByID(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.entityID
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllRemindersOfNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._reminderManager.getAllRemindersOfNode(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteAllRemindersOfNode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._reminderManager.deleteAllRemindersOfNode(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.nodeID
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllRemindersOfWorkspace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._reminderManager.getAllRemindersOfWorkspace(
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default ReminderController;
