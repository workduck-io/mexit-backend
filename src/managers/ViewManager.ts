import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class ViewManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _taskViewLambdaName = `task-${STAGE}-view`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async getView(
    workspaceID: string,
    idToken: string,
    viewID: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._taskViewLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          routeKey: RouteKeys.getView,
          pathParameters: { entityId: viewID },
          headers: {
            'mex-workspace-id': workspaceID,
            authorization: idToken,
            'mex-api-ver': 'v2',
          },
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

  async getAllViews(workspaceID: string, idToken: string): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._taskViewLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          routeKey: RouteKeys.getAllViews,
          headers: {
            'mex-workspace-id': workspaceID,
            authorization: idToken,
            'mex-api-ver': 'v2',
          },
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

  async deleteView(
    workspaceID: string,
    idToken: string,
    viewID: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._taskViewLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'DELETE',
          routeKey: RouteKeys.deleteView,
          pathParameters: { entityId: viewID },
          headers: {
            'mex-workspace-id': workspaceID,
            authorization: idToken,
            'mex-api-ver': 'v2',
          },
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

  async saveView(
    workspaceID: string,
    idToken: string,
    data: any
  ): Promise<any> {
    try {
      const result = this._lambda.invokeAndCheck(
        this._taskViewLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'POST',
          routeKey: RouteKeys.saveView,
          payload: data,
          headers: {
            'mex-workspace-id': workspaceID,
            authorization: idToken,
            'mex-api-ver': 'v2',
          },
        },
        true
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
