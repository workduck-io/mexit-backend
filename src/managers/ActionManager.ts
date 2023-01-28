import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class ActionManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _linkServiceLambdaBase = `mex-url-shortner-${STAGE}`;
  private _lambdaName = {
    action: {
      getAll: `actionHelperService-${STAGE}-getAllActionGroups`,
      get: `actionHelperService-${STAGE}-getAction`,
    },
    auth: {
      get: `authService-${STAGE}-getAuth`,
      getAll: `authService-${STAGE}-getAllAuths`,
      update: `authService-${STAGE}-updateCurrentWorkspace`,
      refresh: `authService-${STAGE}-refreshWorkspaceAuth`,
    },
  };

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async getAction(
    workspaceID: string,
    idToken: string,
    actionGroupId: string,
    actionId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._lambdaName.action.get,
        this._lambdaInvocationType,
        {
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          httpMethod: 'GET',
          pathParameters: { actionGroupId, actionId },
          routeKey: RouteKeys.getAction,
        }
      );

      return result;
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

  async getAllActions(
    workspaceID: string,
    idToken: string,
    actionGroupId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._lambdaName.action.getAll,
        this._lambdaInvocationType,
        {
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          httpMethod: 'GET',
          pathParameters: { actionGroupId },
          routeKey: RouteKeys.getActionsOfActionGroup,
        }
      );

      return result;
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

  async getAuth(
    workspaceID: string,
    idToken: string,
    authTypeId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._lambdaName.auth.get,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          pathParameters: { authTypeId },
          routeKey: RouteKeys.getAuth,
        }
      );

      return result;
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

  async getAllAuths(workspaceID: string, idToken: string): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._lambdaName.auth.getAll,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          routeKey: RouteKeys.getAllAuths,
        }
      );

      return result;
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

  async updateAuth(
    workspaceID: string,
    idToken: string,
    authTypeId: string,
    data: any
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._lambdaName.auth.update,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          pathParameters: { authTypeId },
          payload: data,
          routeKey: RouteKeys.updateAuth,
        }
      );

      return result;
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

  async refreshAuth(
    workspaceID: string,
    idToken: string,
    source: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._lambdaName.auth.refresh,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          pathParameters: { source },
          routeKey: RouteKeys.refreshAuth,
        }
      );

      return result;
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
