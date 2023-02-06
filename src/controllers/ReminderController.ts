import express, { NextFunction, Request, Response } from 'express';
import { statusCodes } from '../libs/statusCodes';
import { RequestClass } from '../libs/RequestClass';
import { initializeReminderRoutes } from '../routes/ReminderRoutes';
import { STAGE } from '../env';

class ReminderController {
  public _urlPath = '/reminder';
  public _router = express.Router();

  private _reminderLambdaName = `reminder-${STAGE}-main`;

  constructor() {
    initializeReminderRoutes(this);
  }

  getReminder = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        this._reminderLambdaName,
        'getReminderByID',
        { pathParameters: { entityId: request.params.entityID } }
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
      const body = new RequestClass(request, 'Reminder').data;
      const result = await response.locals.invoker(
        this._reminderLambdaName,
        'createReminder',
        { payload: body }
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
      const result = await response.locals.invoker(
        this._reminderLambdaName,
        'deleteReminderByID',
        { pathParameters: { entityId: request.params.entityID } }
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
      const result = await response.locals.invoker(
        this._reminderLambdaName,
        'getAllRemindersOfNode',
        { pathParameters: { nodeId: request.params.nodeID } }
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
      const result = await response.locals.invoker(
        this._reminderLambdaName,
        'deleteAllRemindersOfNode',
        { pathParameters: { nodeId: request.params.nodeID } }
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
      const result = await response.locals.invoker(
        this._reminderLambdaName,
        'getAllRemindersOfWorkspace'
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default ReminderController;
