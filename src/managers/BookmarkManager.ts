import { injectable } from 'inversify';
import container from '../inversify.config';

import { STAGE } from '../env';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class BookmarkManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _userStarLambdaFunctionName = `mex-backend-${STAGE}-UserStar`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async createBookmark(
    workspaceId: string,
    idToken: string,
    nodeID: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._userStarLambdaFunctionName,

      {
        routeKey: RouteKeys.createBookmark,
        headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
        pathParameters: { id: nodeID },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async removeBookmark(
    workspaceId: string,
    idToken: string,
    nodeID: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._userStarLambdaFunctionName,

      {
        routeKey: RouteKeys.removeBookmark,
        headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
        pathParameters: { id: nodeID },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async getAllBookmarksForUser(
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._userStarLambdaFunctionName,

      {
        routeKey: RouteKeys.getAllBookmarks,
        headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async batchCreateBookmarks(
    workspaceId: string,
    idToken: string,
    requestBody: { ids: string[] }
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._userStarLambdaFunctionName,

      {
        routeKey: RouteKeys.batchCreateBookmark,
        payload: requestBody,
        headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async batchRemoveBookmarks(
    workspaceId: string,
    idToken: string,
    requestBody: { ids: string[] }
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._userStarLambdaFunctionName,

      {
        routeKey: RouteKeys.batchRemoveBookmark,
        payload: requestBody,
        headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
      }
    );

    return result;
  }
}
