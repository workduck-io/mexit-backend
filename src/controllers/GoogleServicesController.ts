import express, { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authrequest';
import { GoogleAuth } from '../middlewares/googleauth';
import { statusCodes } from '../libs/statusCodes';
import { GotClient } from '../libs/GotClientClass';
import container from '../inversify.config';
import jwtDecode from 'jwt-decode';
import { RequestClass } from '../libs/RequestClass';

class GoogleServicesController {
  private _urlPath = '/googleservices';
  private _router = express.Router();
  private _gotClient: GotClient = container.get<GotClient>(GotClient);
  // Google calendar api endpoint
  private _calendarBaseUrl = 'https://www.googleapis.com/calendar/v3/calendars';

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.delete(
      `${this._urlPath}/calendar/events/:eventId`,
      [AuthRequest, GoogleAuth],
      this.deleteEvent
    );
    this._router.get(
      `${this._urlPath}/calendar/events/:eventId`,
      [AuthRequest, GoogleAuth],
      this.getEvent
    );
    this._router.post(
      `${this._urlPath}/calendar/events/quickAdd`,
      [AuthRequest, GoogleAuth],
      this.quickAddEvent
    );
    this._router.post(
      `${this._urlPath}/calendar`,
      [AuthRequest, GoogleAuth],
      this.createEvent
    );
    this._router.put(
      `${this._urlPath}/calendar`,
      [AuthRequest, GoogleAuth],
      this.updateEvent
    );
    this._router.get(
      `${this._urlPath}/calendar/list`,
      [AuthRequest, GoogleAuth],
      this.listAllEvents
    );
  }

  quickAddEvent = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      if (!request.query.text) throw new Error('text parameter is missing');

      const text = request.query.text.toString();
      const sendNotifications = request.query.sendNotifications
        ? request.query.sendNotifications.toString()
        : undefined;
      const sendUpdates = request.query.sendUpdates
        ? request.query.sendUpdates.toString()
        : undefined;

      const { email } = jwtDecode(response.locals.idToken) as any;

      const requestedEvent = await this._gotClient.post(
        `${this._calendarBaseUrl}/${email}/events/quickAdd`,
        {},
        response.locals.bearerToken,
        {
          text,
          ...(sendUpdates && { sendUpdates }),
          ...(sendNotifications && { sendNotifications }),
        }
      );
      response.status(statusCodes.OK).send(requestedEvent);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  deleteEvent = async (request: Request, response: Response): Promise<any> => {
    try {
      if (!request.params.eventId)
        throw new Error('eventId parameter is missing');

      const eventId = request.params.eventId;
      const sendNotifications = request.query.sendNotifications
        ? request.query.sendNotifications.toString()
        : undefined;
      const sendUpdates = request.query.sendUpdates
        ? request.query.sendUpdates.toString()
        : undefined;

      const { email } = jwtDecode(response.locals.idToken) as any;

      const requestedEvent = await this._gotClient.delete(
        `${this._calendarBaseUrl}/${email}/events/${eventId}`,
        response.locals.bearerToken,
        {
          ...(sendUpdates && { sendUpdates }),
          ...(sendNotifications && { sendNotifications }),
        }
      );
      response.status(statusCodes.OK).send(requestedEvent);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  getEvent = async (request: Request, response: Response): Promise<any> => {
    try {
      if (!request.params.eventId)
        throw new Error('eventId parameter is missing');

      const eventId = request.params.eventId;

      const { email } = jwtDecode(response.locals.idToken) as any;

      const requestedEvent = await this._gotClient.get(
        `${this._calendarBaseUrl}/${email}/events/${eventId}`,
        response.locals.bearerToken,
        {}
      );
      response.status(statusCodes.OK).send(requestedEvent);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  createEvent = async (request: Request, response: Response): Promise<any> => {
    try {
      const requestDetail = new RequestClass(request, 'CalendarEventPayload');

      const sendUpdates = request.query.sendUpdates
        ? request.query.sendUpdates.toString()
        : undefined;
      const supportsAttachments = request.query.supportsAttachments
        ? request.query.supportsAttachments.toString()
        : undefined;

      const { email } = jwtDecode(response.locals.idToken) as any;

      const results = await this._gotClient.post(
        `${this._calendarBaseUrl}/${email}/events`,
        requestDetail.data,
        response.locals.bearerToken,
        {
          ...(sendUpdates && { sendUpdates }),
          ...(supportsAttachments && { supportsAttachments }),
        }
      );

      response.status(statusCodes.OK).send(results);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  updateEvent = async (request: Request, response: Response): Promise<any> => {
    try {
      const requestDetail = new RequestClass(
        request,
        'CalendarEventUpdatePayload'
      );

      if (!request.params.eventId)
        throw new Error('eventId parameter is missing');

      const eventId = request.params.eventId;

      const alwaysIncludeEmail = request.query.alwaysIncludeEmail
        ? request.query.alwaysIncludeEmail.toString()
        : undefined;
      const conferenceDataVersion = request.query.conferenceDataVersion
        ? request.query.conferenceDataVersion.toString()
        : undefined;
      const maxAttendees = request.query.maxAttendees
        ? request.query.maxAttendees.toString()
        : undefined;
      const sendNotifications = request.query.sendNotifications
        ? request.query.sendNotifications.toString()
        : undefined;
      const sendUpdates = request.query.sendUpdates
        ? request.query.sendUpdates.toString()
        : undefined;
      const supportsAttachments = request.query.supportsAttachments
        ? request.query.supportsAttachments.toString()
        : undefined;

      const { email } = jwtDecode(response.locals.idToken) as any;

      const results = await this._gotClient.put(
        `${this._calendarBaseUrl}/${email}/events/${eventId}`,
        requestDetail.data,
        response.locals.bearerToken,
        {
          ...(sendUpdates && { sendUpdates }),
          ...(supportsAttachments && { supportsAttachments }),
          ...(sendNotifications && { sendNotifications }),
          ...(maxAttendees && { maxAttendees }),
          ...(conferenceDataVersion && { conferenceDataVersion }),
          ...(alwaysIncludeEmail && { alwaysIncludeEmail }),
        }
      );

      response.status(statusCodes.OK).send(results);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  listAllEvents = async (
    request: Request,
    response: Response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    try {
      const maxResults = request.query.maxResults
        ? request.query.maxResults.toString()
        : undefined;
      const timeMin = request.query.timeMin
        ? request.query.timeMin.toString()
        : undefined;
      const timeMax = request.query.timeMax
        ? request.query.timeMax.toString()
        : undefined;

      const { email } = jwtDecode(response.locals.idToken) as any;

      const results = await this._gotClient.get(
        `${this._calendarBaseUrl}/${email}/events`,
        response.locals.bearerToken,
        {
          singleEvents: true,
          orderBy: 'startTime',
          ...(maxResults && { maxResults }),
          ...(timeMin && { timeMin }),
          ...(timeMax && { timeMax }),
        }
      );
      const allEvents = results.data as any;
      const latestNEvents = allEvents.items;

      response.status(statusCodes.OK).send(latestNEvents);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };
}

export default GoogleServicesController;
