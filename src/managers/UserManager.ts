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
  private _userLambdaFunctionName = 'workduck-user-service-local-user';

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createUserPreference(userPreference: UserPreference): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.createUserPreference,
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
  async getByIdAndTag(userId: string, tag: string): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getByIdAndTag,
          pathParameters: { id: userId, tag: tag },
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
  async getByGroupIdAndTag(groupId: string, tag: string): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getByGroupIdAndTag,
          pathParameters: { groupId: groupId, tag: tag },
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
}
