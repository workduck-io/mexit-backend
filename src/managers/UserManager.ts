import { injectable } from 'inversify';

import { STAGE } from '../env';
import { User, UserPreference } from '../interfaces/User';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class UserManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _userLambdaFunctionName = `workduck-user-service-${STAGE}-user`;
  private _getUserLambdaFunctionName = `workduck-user-service-${STAGE}-getUser`;
  private _userMexBackendLambdaFunctionName = `mex-backend-${STAGE}-User`;
  private _registerStatusLambdaFunctionName = `workduck-user-service-${STAGE}-registerStatus`;
  private _inviteUserLambdaFunctionName = `workduck-user-service-${STAGE}-invite`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async updateUserDetails(
    userDetails: User,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.updateUserDetails,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
          payload: userDetails,
          httpMethod: 'PUT',
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
          httpMethod: 'PUT',
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

  async getInvite(inviteId: string): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._inviteUserLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getInvite,
          pathParameters: { inviteId },
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

  async deleteInvite(
    workspaceID: string,
    idToken: string,
    inviteId: string
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._inviteUserLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.deleteInvite,
          pathParameters: { inviteId },
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          httpMethod: 'DELETE',
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

  async getInvitesOfWorkspace(
    workspaceID: string,
    idToken: string
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._inviteUserLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllInviteOfWorkspace,
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
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

  async createInvite(
    workspaceID: string,
    idToken: string,
    payload
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._inviteUserLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.createInvite,
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          payload,
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
  async getUsersOfWorkspace(
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const respone = await this._lambda.invokeAndCheck(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getUsersOfWorkspace,
          httpMethod: 'GET',
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
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

  async registerStatus(idToken: string): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._registerStatusLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.registerStatus,
          httpMethod: 'GET',
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
}
