/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { STAGE } from '../env';

@injectable()
export class TagManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _tagLambdaFunctionName = `mex-backend-${STAGE}-Tag`;
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async getAllTagsOfWorkspace(
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._tagLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllTagsOfWorkspace,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );
      return response;
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
  async getNodeWithTag(
    workspaceId: string,
    idToken: string,
    tagName: string
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._tagLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getNodeWithTag,
          pathParameters: { tagName: tagName },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );
      return response;
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
