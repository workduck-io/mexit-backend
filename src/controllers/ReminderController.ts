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
      const result = await response.locals.invoker(
        'GetReminderByID',
        { pathParameters: { entityID: request.params.entityID } },
        'APIGateway'
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createReminder = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const body = new RequestClass(request, 'Reminder').data;
      const result = await response.locals.invoker(
        'CreateReminder',
        { payload: body, pathParameters: { entityID: request.params.entityID } },
        'APIGateway'
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteReminder = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        'DeleteReminderByID',
        { pathParameters: { entityID: request.params.entityID } },
        'APIGateway'
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllRemindersOfNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        'GetAllRemindersOfNode',
        { pathParameters: { nodeID: request.params.nodeID } },
        'APIGateway'
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteAllRemindersOfNode = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker(
        'DeleteAllRemindersOfNode',
        { pathParameters: { nodeID: request.params.nodeID } },
        'APIGateway'
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllRemindersOfWorkspace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('GetAllRemindersOfWorkspace', undefined, 'APIGateway');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default ReminderController;
