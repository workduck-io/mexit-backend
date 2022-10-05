import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { STAGE } from '../env';
import { RouteKeys } from '../libs/routeKeys';

@injectable()
export class ViewManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _taskViewLambdaNameBase = `task-${STAGE}`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async getView(
    workspaceID: string,
    idToken: string,
    viewID: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        `${this._taskViewLambdaNameBase}-getView`,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          pathParameters: { id: viewID },
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
        `${this._taskViewLambdaNameBase}-getAllViewsOfWorkspace`,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
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
        `${this._taskViewLambdaNameBase}-delView`,
        this._lambdaInvocationType,
        {
          httpMethod: 'DELETE',
          pathParameters: { id: viewID },
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
        `${this._taskViewLambdaNameBase}-postView`,
        this._lambdaInvocationType,
        {
          httpMethod: 'POST',
          payload: data,
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
}
