import { injectable } from 'inversify';
import container from '../inversify.config';

import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';

import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { STAGE } from '../env';

@injectable()
export class BookmarkManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _userLambdaFunctionName = `mex-backend-${STAGE}-UserBookmark`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async createBookmark(
    nodeID: string,
    userID: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.createBookmark,
          headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
          pathParameters: { userID, nodeID },
          payload: { type: 'BookmarkRequest' },
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
  async removeBookmark(
    nodeID: string,
    userID: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.removeBookmark,
          headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
          pathParameters: { userID, nodeID },
          payload: { type: 'BookmarkRequest' },
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

  async getAllBookmarksForUser(
    userID: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._userLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllBookmarks,
          headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
          pathParameters: { userID },
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
