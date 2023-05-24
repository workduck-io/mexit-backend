import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

import { IS_DEV } from '../env';
import container from '../inversify.config';
import { GotClient } from '../libs/GotClientClass';
import { statusCodes } from '../libs/statusCodes';
import { initializeOAuth2Routes } from '../routes/OAuth2Routes';

class OAuth2Controller {
  public _urlPath = '/oauth2';
  public _router = express.Router();

  private _gotClient: GotClient = container.get<GotClient>(GotClient);
  private _oauth2Client: OAuth2Client;

  private static readonly redirectUri = IS_DEV
    ? 'http://localhost:5002/api/v1/oauth2/google'
    : 'https://mex-webapp-dev.workduck.io/api/v1/oauth2/google';
  private static readonly googleOAuthTokenUrl = 'https://www.googleapis.com/oauth2/v4/token';

  constructor() {
    initializeOAuth2Routes(this);
    this.initializeGoogleOAuthClient();
  }

  initializeGoogleOAuthClient(): void {
    if (!process.env.MEXIT_BACKEND_GOOGLE_CLIENT_ID) throw new Error('Client Id Not Provided');
    if (!process.env.MEXIT_BACKEND_GOOGLE_CLIENT_SECRET) throw new Error('Client Secret Not Provided');

    this._oauth2Client = new OAuth2Client({
      clientId: process.env.MEXIT_BACKEND_GOOGLE_CLIENT_ID,
      clientSecret: process.env.MEXIT_BACKEND_GOOGLE_CLIENT_SECRET,
      redirectUri: OAuth2Controller.redirectUri,
    });
  }

  getNewAccessToken = async (request: Request, response: Response): Promise<void> => {
    try {
      const userId = response.locals.userIdRaw;
      //Fetch the refresh token from auth service
      const storedAuth = await response.locals.invoker('getAuth', {
        pathParameters: { authTypeId: 'GOOGLECALENDAR_OAUTH' },
        queryStringParameters: {
          userId,
        },
      });

      if (!storedAuth) throw new Error('Token missing in auth service');

      const itemValues: any = Object.values(storedAuth.auth[0])[0];
      const refreshToken = itemValues.authData.refreshToken as string;

      const payload = {
        client_id: process.env.MEXIT_BACKEND_GOOGLE_CLIENT_ID,
        client_secret: process.env.MEXIT_BACKEND_GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      };
      const result = await this._gotClient.request(OAuth2Controller.googleOAuthTokenUrl, {
        json: payload,
      });
      //Update the new access token in auth service
      const newAccessToken = result.body.access_token;
      const expiryTime = result.body.expires_in;
      await response.locals.invoker('refreshAuth', {
        payload: { serviceUserId: userId, accessToken: newAccessToken, expiryTime },
        pathParameters: { source: 'googlecalendar' },
      });

      response.status(statusCodes.OK).json({ data: result.body, status: result.statusCode });
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };

  extractTokenFromCode = async (request: Request, response: Response): Promise<void> => {
    const code = request.query.code;
    const userId = request.query.userId;
    try {
      const { tokens } = await this._oauth2Client.getToken(code.toString());

      // Persist the tokens in the auth service
      await response.locals.invoker('createUserAuth', {
        pathParameters: { source: 'googlecalendar' },
        queryStringParameters: {
          state: `DUMMY_WORKSPACE:${userId}`,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          email: response.locals.userEmail,
          expires_in: tokens.expiry_date,
        },
      });
      response
        .set('Content-Type', 'text/html')
        .send(
          Buffer.from(
            `<html lang="en"><head><meta charset="UTF-8"><title>Auth Success</title> <script>window.location.href="mex://redirect?access_token=${tokens.access_token}&id_token=${tokens.id_token}&refresh_token=${tokens.refresh_token}&type=calendar_google"; window.close()</script></head><body><p>Please return to the mex app...</p></body></html>`
          )
        )
        .status(200);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error).json();
    }
  };

  getGoogleCalendarScopeAuth = async (request: Request, response: Response): Promise<any> => {
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
          prompt: 'consent',
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
