import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class LinkManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _linkServiceLambdaBase = `mex-url-shortner-${STAGE}`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async createNewShort(
    workspaceID: string,
    idToken: string,
    data: any
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      `${this._linkServiceLambdaBase}-shorten`,
      this._lambdaInvocationType,
      {
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
        httpMethod: 'POST',
        payload: data,
      },
      true
    );

    return result;
  }

  @BubbleUnexpectedError()
  async getAllShortsOfWorkspace(
    workspaceID: string,
    idToken: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      `${this._linkServiceLambdaBase}-workspaceDetails`,
      this._lambdaInvocationType,
      {
        httpMethod: 'GET',
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
      },
      true
    );

    return result;
  }

  @BubbleUnexpectedError()
  async deleteShort(
    workspaceID: string,
    idToken: string,
    url: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      `${this._linkServiceLambdaBase}-del`,
      this._lambdaInvocationType,
      {
        httpMethod: 'DELETE',
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
        pathParameters: { url: url },
      },
      true
    );

    return result;
  }

  @BubbleUnexpectedError()
  async getStatsByURL(
    workspaceID: string,
    idToken: string,
    url: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      `${this._linkServiceLambdaBase}-stats`,
      this._lambdaInvocationType,
      {
        httpMethod: 'GET',
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
        pathParameters: { url: url },
      }
    );

    return result;
  }
}
