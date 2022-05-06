import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { UserPreference } from '../interfaces/User';

@injectable()
export class UserManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _userLambdaFunctionName = 'workduck-user-service-dev-user';
  private _userMexBackendLambdaFunctionName = 'mex-backend-test-User';
  private _initializeWorkspaceLambdaName =
    'initialize-workspace-test-initializeWorkspace';

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateUserPreference(userPreference: UserPreference): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.updateUserPreference,
          payload: userPreference,
        },
        true
      );

      return result.body;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(idToken: string): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getUser,
          headers: { authorization: idToken },
        }
      );
      return result.body;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getById(userId: string): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getById,
          pathParameters: { userId },
        }
      );
      return result.body;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getByGroupId(groupId: string): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getByGroupId,
          pathParameters: { groupId: groupId },
        }
      );
      return result.body;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  async getUserByLinkedin(payload: any): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getUserByLinkedin,
          payload: payload,
        },
        true
      );

      return result.body;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  // eslint-disable-next-line
  async registerUser(idToken: string, payload: any): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._userMexBackendLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.registerUser,
          payload: { ...payload, type: 'RegisterUserRequest' },
          headers: { 'mex-workspace-id': '', authorization: idToken },
        }
      );
      return result;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  // eslint-disable-next-line
  async initializeWorkspace(payload: any): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._initializeWorkspaceLambdaName,
        this._lambdaInvocationType,
        {
          payload: payload,
        },
        false,
        'Direct'
      );

      return result;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
}
