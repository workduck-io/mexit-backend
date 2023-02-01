import { injectable } from 'inversify';

import { STAGE } from '../env';
import { User, UserPreference } from '../interfaces/User';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class UserManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _userLambdaFunctionName = `workduck-user-service-${STAGE}-user`;
  private _getUserLambdaFunctionName = `workduck-user-service-${STAGE}-getUser`;
  private _userMexBackendLambdaFunctionName = `mex-backend-${STAGE}-User`;
  private _registerStatusLambdaFunctionName = `workduck-user-service-${STAGE}-registerStatus`;
  private _inviteUserLambdaFunctionName = `workduck-user-service-${STAGE}-invite`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async updateUserDetails(
    userDetails: User,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async updateUserPreference(
    userPreference: UserPreference,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
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
  }
  @BubbleUnexpectedError()
  async get(workspaceId: string, idToken: string): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._getUserLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getUser,
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        httpMethod: 'GET',
      }
    );

    return response;
  }

  @BubbleUnexpectedError()
  async getInvite(inviteId: string): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async deleteInvite(
    workspaceID: string,
    idToken: string,
    inviteId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async getInvitesOfWorkspace(
    workspaceID: string,
    idToken: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async createInvite(
    workspaceID: string,
    idToken: string,
    payload
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async getById(userId: string): Promise<any> {
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
  }
  @BubbleUnexpectedError()
  async getByMail(email: string): Promise<any> {
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
  }
  @BubbleUnexpectedError()
  async getUsersOfWorkspace(
    workspaceId: string,
    idToken: string
  ): Promise<any> {
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
  }
  @BubbleUnexpectedError()
  async getUserByLinkedin(payload: any): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async registerStatus(idToken: string): Promise<any> {
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
  }
}
