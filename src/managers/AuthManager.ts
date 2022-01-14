import { injectable } from 'inversify';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import { AuthorizeType, AuthorizeRefreshTokenType } from '../interfaces/Auth';
import config from '../config';

@injectable()
export class AuthManager {
  async performAuthWithAWS(params: AuthorizeType): Promise<unknown> {
    const authenticationData = {
      Username: params.email,
      Password: params.password,
    };
    const authenticationDetails =
      new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    const poolData = {
      UserPoolId: config.cognito.USER_POOL_ID,
      ClientId: config.cognito.APP_CLIENT_ID,
    };
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    const userData = {
      Username: params.email,
      Pool: userPool,
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    return new Promise(function (resolve, reject) {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: resolve,
        onFailure: reject,
      });
    });
  }

  async GetNewJWTTokenFromAWS(
    params: AuthorizeRefreshTokenType
  ): Promise<unknown> {
    const refreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({
      RefreshToken: params.refreshToken,
    });

    const poolData = {
      UserPoolId: config.cognito.USER_POOL_ID,
      ClientId: config.cognito.APP_CLIENT_ID,
    };
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    const userData = {
      Username: params.email,
      Pool: userPool,
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    return new Promise(function (resolve, reject) {
      cognitoUser.refreshSession(refreshToken, (err, session) => {
        if (err) reject(err);
        else resolve(session);
      });
    });
  }
}
