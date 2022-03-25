import express, { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authrequest';
import { statusCodes } from '../libs/statusCodes';
import { google } from 'googleapis';
import { IS_DEV } from '../env';
import { GotClient } from '../libs/GotClientClass';
import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
// eslint-disable-next-line node/no-extraneous-import
import { OAuth2Client } from 'google-auth-library';

class OAuth2Controller {
  private _urlPath = '/oauth2';
  private _router = express.Router();

  private _gotClient: GotClient = container.get<GotClient>(GotClient);
  private _oauth2Client: OAuth2Client;

  private static readonly redirectUri = IS_DEV
    ? 'http://localhost:5000/api/v1/oauth2/google'
    : 'https://mex-webapp-dev.workduck.io/api/v1/oauth2/google';
  private static readonly googleOAuthTokenUrl =
    'https://www.googleapis.com/oauth2/v4/token';

  constructor() {
    this.initializeRoutes();
    this.initializeGoogleOAuthClient();
  }

  initializeGoogleOAuthClient(): void {
    if (!process.env.client_id) throw new Error('Client Id Not Provided');
    if (!process.env.client_secret)
      throw new Error('Client Secret Not Provided');

    this._oauth2Client = new google.auth.OAuth2({
      clientId: process.env.client_id,
      clientSecret: process.env.client_secret,
      redirectUri: OAuth2Controller.redirectUri,
    });

    google.options({ auth: this._oauth2Client });
  }

  initializeRoutes(): void {
    this._router.post(
      `${this._urlPath}/getGoogleAccessToken`,
      [AuthRequest],
      this.getNewAccessToken
    );
    this._router.get(
      `${this._urlPath}/getGoogleAuthUrl`,
      [AuthRequest],
      this.getGoogleCalendarScopeAuth
    );
    this._router.get(`${this._urlPath}/google`, [], this.extractTokenFromCode);
  }

  getNewAccessToken = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'GoogleAuthRefreshToken');
      const payload = {
        client_id: process.env.client_id,
        client_secret: process.env.client_secret,
        refresh_token: requestDetail.data.refreshToken,
        grant_type: 'refresh_token',
      };
      const result = await this._gotClient.post(
        OAuth2Controller.googleOAuthTokenUrl,
        payload,
        ''
      );
      response.status(statusCodes.OK).send(result).json();
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };

  extractTokenFromCode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    const code = request.query.code;
    try {
      const { tokens } = await this._oauth2Client.getToken(code.toString());
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
      const googleAuthUrl = await this.getGoogleAuthUrl(scopes);
      response.send(googleAuthUrl).status(200);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };

  private getGoogleAuthUrl(scopes: string[]) {
    return new Promise((resolve, reject) => {
      try {
        const authorizeUrl = this._oauth2Client.generateAuthUrl({
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
