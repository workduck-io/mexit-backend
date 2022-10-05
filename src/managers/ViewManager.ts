import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { STAGE } from '../env';

@injectable()
export class ViewManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _taskViewLambdaNameBase = `${STAGE}-task`;

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
          pathParameters: { id: viewID },
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
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
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
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
          pathParameters: { id: viewID },
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
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
          payload: data,
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
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
