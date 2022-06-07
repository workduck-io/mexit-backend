/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
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
  ): Promise<string[]> {
    try {
      const result = await this._lambda.invoke(
        this._tagLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllTagsOfWorkspace,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );

      const response: string = result.body;

      if (!response) throw new Error('Something went wrong');
      const allNodes = JSON.parse(response);
      return allNodes;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
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
  ): Promise<string[]> {
    try {
      const result = await this._lambda.invoke(
        this._tagLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getNodeWithTag,
          pathParameters: { tagName: tagName },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );
      const response: string = result.body;

      if (!response) throw new Error('Something went wrong');
      const allNodes = JSON.parse(response);
      return allNodes;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
}
