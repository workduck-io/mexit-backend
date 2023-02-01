import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class ReminderManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _reminderLambdaName = `reminder-${STAGE}-main`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async getReminderByID(
    workspaceID: string,
    idToken: string,
    entityId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async createReminder(
    workspaceID: string,
    idToken: string,
    data: any
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._reminderLambdaName,
      this._lambdaInvocationType,
      {
        httpMethod: 'POST',
        routeKey: RouteKeys.createReminder,
        payload: data,
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
      },
      true
    );

    return result;
  }

  @BubbleUnexpectedError()
  async deleteReminderByID(
    workspaceID: string,
    idToken: string,
    entityId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async getAllRemindersOfNode(
    workspaceID: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async deleteAllRemindersOfNode(
    workspaceID: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async getAllRemindersOfWorkspace(
    workspaceID: string,
    idToken: string
  ): Promise<any> {
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
  }
}
