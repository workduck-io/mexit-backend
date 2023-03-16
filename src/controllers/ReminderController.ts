import express, { NextFunction, Request, Response } from 'express';

import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeReminderRoutes } from '../routes/ReminderRoutes';

class ReminderController {
  public _urlPath = '/reminder';
  public _router = express.Router();

  constructor() {
    initializeReminderRoutes(this);
  }

  getReminder = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.gatewayInvoker('GetReminderByID', undefined, request.params.entityID);

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createReminder = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'Reminder').data;
      const result = await response.locals.gatewayInvoker('CreateReminder', { payload: body });

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteReminder = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.gatewayInvoker('DeleteReminderByID', undefined, request.params.entityID);

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllRemindersOfNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.gatewayInvoker('GetAllRemindersOfNode', undefined, request.params.nodeID );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteAllRemindersOfNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.gatewayInvoker('DeleteAllRemindersOfNode',undefined, request.params.nodeID );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllRemindersOfWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.gatewayInvoker('GetAllRemindersOfWorkspace'); 

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default ReminderController;
