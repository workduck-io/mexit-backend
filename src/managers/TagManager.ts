/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class TagManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _tagLambdaFunctionName = `mex-backend-${STAGE}-Tag`;
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async getAllTagsOfWorkspace(
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._tagLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getAllTagsOfWorkspace,
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async getNodeWithTag(
    workspaceId: string,
    idToken: string,
    tagName: string
  ): Promise<any> {
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
  }
}
