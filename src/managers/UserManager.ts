import { injectable } from 'inversify';

import { STAGE } from '../env';
import { UserPreference } from '../interfaces/User';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class UserManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _userLambdaFunctionName = 'workduck-user-service-dev-user';
  private _getUserLambdaFunctionName = 'workduck-user-service-dev-getUser';
  private _userMexBackendLambdaFunctionName = `mex-backend-${STAGE}-User`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async updateUserPreference(
    userPreference: UserPreference,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.updateUserPreference,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },

          payload: userPreference,
          httpMethod: 'POST',
        },
        true
      );
      return response;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  async get(idToken: string): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._getUserLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getUser,
          headers: { authorization: idToken },
          httpMethod: 'GET',
        }
      );
      return response;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  async getById(userId: string): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._getUserLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getById,
          pathParameters: { userId },
          httpMethod: 'GET',
        }
      );
      return response;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  async getByMail(email: string): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._getUserLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getByEmail,
          pathParameters: { email },
          httpMethod: 'GET',
        }
      );
      return response;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  async getByGroupId(groupId: string): Promise<any> {
    try {
      const respone = await this._lambda.invokeAndCheck(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getByGroupId,
          pathParameters: { groupId: groupId },
          httpMethod: 'GET',
        }
      );
      return respone;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  // eslint-disable-next-line
  async getUserByLinkedin(payload: any): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._getUserLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getUserByLinkedin,
          payload: payload,
          httpMethod: 'GET',
        },
        true
      );

      return response;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  async getAllUsernames(
    // eslint-disable-next-line
    payload: any,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllUsernames,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
          payload: payload,
          httpMethod: 'POST',
        },
        true
      );

      return response;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  // eslint-disable-next-line
  async registerUser(idToken: string, payload: any): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._userMexBackendLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.registerUser,
          payload: { ...payload, type: 'RegisterUserRequest' },
          headers: { 'mex-workspace-id': '', authorization: idToken },
          httpMethod: 'POST',
        }
      );
      return response;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
}
