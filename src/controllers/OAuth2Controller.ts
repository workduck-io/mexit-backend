import express, { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authrequest';
import { statusCodes } from '../libs/statusCodes';
import { google } from 'googleapis';
import { IS_DEV } from '../env';

class OAuth2Controller {
  private _urlPath = '/oauth2';
  private _router = express.Router();

  private static readonly redirectUri = IS_DEV
    ? 'http://localhost:5000/api/v1/oauth2/google'
    : '';

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.get(
      `${this._urlPath}/getGoogleAuthUrl`,
      [AuthRequest],
      this.getGoogleCalendarScopeAuth
    );
    this._router.get(`${this._urlPath}/google`, [], this.extractTokenFromCode);
  }

  extractTokenFromCode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.client_id,
      clientSecret: process.env.client_secret,
      redirectUri: OAuth2Controller.redirectUri,
    });

    google.options({ auth: oauth2Client });

    console.log(request.query.code);

    const code = request.query.code;
    try {
      const { tokens } = await oauth2Client.getToken(code.toString());
      // TODO: store this refresh token into the auth service
      console.log(tokens);
      response
        .set('Content-Type', 'text/html')
        .send(
          Buffer.from(
            `<html lang="en"><head><meta charset="UTF-8"><title>Auth Success</title> <script>window.location.href="mex://localhost:3333?access_token=${tokens.access_token}&id_token=${tokens.id_token}&type=calendar_google"; window.close()</script></head><body><p>Please return to the mex app...</p></body></html>`
          )
        )
        .status(200);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };

  getGoogleCalendarScopeAuth = async (
    request: Request,
    response: Response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    try {
      const scopes = [
        'email',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/plus.login',
      ];
      const googleAuthUrl = await OAuth2Controller.getGoogleAuthUrl(scopes);
      response.send(googleAuthUrl).status(200);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };

  private static getGoogleAuthUrl(scopes: string[]) {
    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.client_id,
      clientSecret: process.env.client_secret,
      redirectUri: OAuth2Controller.redirectUri,
    });

    google.options({ auth: oauth2Client });
    return new Promise((resolve, reject) => {
      try {
        const authorizeUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: scopes.join(' '),
        });
        resolve(authorizeUrl);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default OAuth2Controller;
