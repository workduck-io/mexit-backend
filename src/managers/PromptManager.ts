import { injectable } from 'inversify';

import { STAGE } from '../env';
import { LocalsX } from '../interfaces/Locals';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';
import { generateLambdaInvokePayload } from '../utils/lambda';

@injectable()
export class PromptManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _promptLambdaName = `gpt3Prompt-${STAGE}-main`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async getAllPrompts(workspaceID: string, idToken: string): Promise<any> {
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
  async getUserAuthInfo(locals: LocalsX): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._promptLambdaName,
      this._lambdaInvocationType,
      generateLambdaInvokePayload(locals, 'getUserAuthInfo')
    );

    return result;
  }

  @BubbleUnexpectedError()
  async updateUserAuthInfo<T = any>(locals: LocalsX, body: T): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._promptLambdaName,
      this._lambdaInvocationType,
      generateLambdaInvokePayload<T>(locals, 'updateUserAuthInfo', {
        payload: body,
      })
    );

    return result;
  }

  @BubbleUnexpectedError()
  async getAllPromptProviders(locals: LocalsX): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._promptLambdaName,
      this._lambdaInvocationType,
      generateLambdaInvokePayload(locals, 'getAllPromptProviders')
    );

    return result;
  }

  @BubbleUnexpectedError()
  async generatePromptResult<T = any>(
    locals: LocalsX,
    promptID: string,
    body: T
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._promptLambdaName,
      this._lambdaInvocationType,
      generateLambdaInvokePayload<T>(locals, 'generatePromptResult', {
        payload: body,
        pathParameters: { id: promptID },
      })
    );

    return result;
  }
}
