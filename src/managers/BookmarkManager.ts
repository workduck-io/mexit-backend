import { injectable } from 'inversify';
import container from '../inversify.config';

import { errorlib } from '../libs/errorlib';
import { statusCodes } from '../libs/statusCodes';

import { STAGE } from '../env';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';

@injectable()
export class BookmarkManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _userStarLambdaFunctionName = `mex-backend-${STAGE}-UserStar`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async createBookmark(
    workspaceId: string,
    idToken: string,
    nodeID: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._userStarLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.createBookmark,
          headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
          pathParameters: { id: nodeID },
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
    workspaceId: string,
    idToken: string,
    nodeID: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._userStarLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.removeBookmark,
          headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
          pathParameters: { id: nodeID },
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
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._userStarLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllBookmarks,
          headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
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

  async batchCreateBookmarks(
    workspaceId: string,
    idToken: string,
    requestBody: { ids: string[] }
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._userStarLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.batchCreateBookmark,
          payload: requestBody,
          headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
        }
      );

      return result;
    } catch (error) {
      errorlib({
        message: error.messsage,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }

  async batchRemoveBookmarks(
    workspaceId: string,
    idToken: string,
    requestBody: { ids: string[] }
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._userStarLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.batchRemoveBookmark,
          payload: requestBody,
          headers: { authorization: idToken, 'mex-workspace-id': workspaceId },
        }
      );

      return result;
    } catch (error) {
      errorlib({
        message: error.messsage,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
}
