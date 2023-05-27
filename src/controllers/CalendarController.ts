import express, { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../libs/statusCodes';
import { initializeCalendarRoutes } from '../routes/CalendarRoutes';

import OAuth2Controller from './OAuth2Controller';

class CalendarController {
  public _urlPath = '/calendar';
  public _router = express.Router();

  constructor() {
    initializeCalendarRoutes(this);
  }

  getAllCalendarConfigs = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const allCalendarConfigs = [
        {
          actionGroupId: 'GOOGLE_CAL',
          authConfig: { authURL: await OAuth2Controller.getGoogleCalendarAuthUrl() },
          icon: 'logos:google-calendar',
          connected: false,
          name: 'Google Calendar',
          description: 'Integrate Mex with your Google Calendar and view all your upcoming meetings from Mex.',
        },
      ];
      response.status(statusCodes.OK).json(allCalendarConfigs);
    } catch (error) {
      next(error);
    }
  };
}
export default CalendarController;
