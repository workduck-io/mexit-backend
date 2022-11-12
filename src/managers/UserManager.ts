import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { UserPreference } from '../interfaces/User';
import { STAGE } from '../env';

@injectable()
export class UserManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _userLambdaFunctionName = 'workduck-user-service-dev-user';
  private _userMexBackendLambdaFunctionName = `mex-backend-${STAGE}-User`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async updateUserPreference(userPreference: UserPreference): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.updateUserPreference,
          payload: userPreference,
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
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getUser,
          headers: { authorization: idToken },
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
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getById,
          pathParameters: { userId },
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
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getUserByLinkedin,
          payload: payload,
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
