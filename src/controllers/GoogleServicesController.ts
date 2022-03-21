import express, { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authrequest';
import { statusCodes } from '../libs/statusCodes';
import { GotClient } from '../libs/GotClientClass';
import container from '../inversify.config';
import jwtDecode from 'jwt-decode';

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
    this._router.get(
      `${this._urlPath}/calendar/list`,
      [AuthRequest],
      this.listAllEvents
    );
  }

  listAllEvents = async (
    request: Request,
    response: Response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    try {
      if (!request.headers['mex-google-access-token'])
        throw new Error('mex-google-access-token header is missing');
      if (!request.headers['mex-google-id-token'])
        throw new Error('mex-google-id-token header is missing');

      const bearerToken = `Bearer ${request.headers['mex-google-access-token']}`;
      const idToken = `Bearer ${request.headers['mex-google-id-token']}`;

      const maxResults =
        request.query.maxResults ?? request.query.maxResults.toString();
      const timeMin = request.query.timeMin
        ? request.query.timeMin.toString()
        : undefined;
      const timeMax = request.query.timeMax
        ? request.query.timeMax.toString()
        : undefined;

      const { email } = jwtDecode(idToken) as any;

      const results = await this._gotClient.get(
        `${this._calendarBaseUrl}/${email}/events`,
        bearerToken,
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

      response.status(200).send(latestNEvents);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };
}

export default GoogleServicesController;
