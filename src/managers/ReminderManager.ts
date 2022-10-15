import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { STAGE } from '../env';
import { RouteKeys } from '../libs/routeKeys';

@injectable()
export class ReminderManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _reminderLambdaName = `reminder-${STAGE}-main`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async getReminderByID(
    workspaceID: string,
    idToken: string,
    entityId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._reminderLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          routeKey: RouteKeys.getReminderByID,
          pathParameters: { entityId: entityId },
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

  async createReminder(
    workspaceID: string,
    idToken: string,
    data: any
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._reminderLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'POST',
          routeKey: RouteKeys.createReminder,
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

  async deleteReminderByID(
    workspaceID: string,
    idToken: string,
    entityId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._reminderLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'DELETE',
          routeKey: RouteKeys.deleteReminderByID,
          pathParameters: { entityId: entityId },
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

  async getAllRemindersOfNode(
    workspaceID: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._reminderLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          routeKey: RouteKeys.getAllRemindersOfNode,
          pathParameters: { nodeId: nodeId },
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

  async deleteAllRemindersOfNode(
    workspaceID: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._reminderLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'DELETE',
          routeKey: RouteKeys.deleteAllRemindersOfNode,
          pathParameters: { nodeId: nodeId },
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

  async getAllRemindersOfWorkspace(
    workspaceID: string,
    idToken: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._reminderLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          routeKey: RouteKeys.getAllRemindersOfWorkspace,
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
