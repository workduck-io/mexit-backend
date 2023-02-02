import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class PromptManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _promptLambdaName = `gpt3Prompt-${STAGE}`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async getAllPromps(workspaceID: string, idToken: string): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._promptLambdaName,
      this._lambdaInvocationType,
      {
        httpMethod: 'GET',
        routeKey: RouteKeys.getAllPrompts,
        headers: {
          'mex-workspace-id': workspaceID,
          authorization: idToken,
        },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async getUserAuthInfo(workspaceID: string, idToken: string): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._promptLambdaName,
      this._lambdaInvocationType,
      {
        httpMethod: 'GET',
        routeKey: RouteKeys.getUserAuthInfo,
        headers: {
          'mex-workspace-id': workspaceID,
          authorization: idToken,
        },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async updateUserAuthInfo(
    workspaceID: string,
    idToken: string,
    body: any
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._promptLambdaName,
      this._lambdaInvocationType,
      {
        httpMethod: 'POST',
        routeKey: RouteKeys.updateUserAuthInfo,
        headers: {
          'mex-workspace-id': workspaceID,
          authorization: idToken,
        },
        payload: body,
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async getAllPromptProviders(
    workspaceID: string,
    idToken: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._promptLambdaName,
      this._lambdaInvocationType,
      {
        httpMethod: 'GET',
        routeKey: RouteKeys.getAllPromptProviders,
        headers: {
          'mex-workspace-id': workspaceID,
          authorization: idToken,
        },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async generatePromptResult(
    workspaceID: string,
    idToken: string,
    body: any
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._promptLambdaName,
      this._lambdaInvocationType,
      {
        httpMethod: 'POST',
        routeKey: RouteKeys.generatePromptResult,
        headers: {
          'mex-workspace-id': workspaceID,
          authorization: idToken,
        },
        payload: body,
      }
    );

    return result;
  }
}
