import { injectable } from 'inversify';

import { STAGE } from '../env';
import { PostView } from '../interfaces/Request';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class ViewManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _taskViewLambdaName = `task-${STAGE}-view`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async getView(
    workspaceID: string,
    idToken: string,
    viewID: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async getAllViews(workspaceID: string, idToken: string): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async deleteView(
    workspaceID: string,
    idToken: string,
    viewID: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async saveView(
    workspaceID: string,
    idToken: string,
    data: PostView
  ): Promise<any> {
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
  }
}
