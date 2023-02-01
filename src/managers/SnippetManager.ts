/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';
import { STAGE } from '../env';
import { BulkResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class SnippetManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _snippetLambdaFunctionName = `mex-backend-${STAGE}-Snippet`;
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async createSnippet(
    workspaceId: string,
    idToken: string,
    snippetDetail: any,
    createNextVersion = false
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.createSnippet,
        payload: snippetDetail,
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        queryStringParameters: { createNextVersion },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async getSnippet(
    snippetId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getSnippet,
        pathParameters: { id: snippetId },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );

    return response;
  }

  @BubbleUnexpectedError()
  async bulkGetSnippet(
    snippetIDs: string[],
    workspaceId: string,
    idToken: string
  ): Promise<BulkResponse<any>> {
    const lambdaPromises = snippetIDs.map(id =>
      this._lambda.invokeAndCheck(
        this._snippetLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getSnippet,
          pathParameters: { id },
          headers: {
            'mex-workspace-id': workspaceId,
            authorization: idToken,
          },
        }
      )
    );

    const promiseResponses = await Promise.allSettled(lambdaPromises);
    const result = { successful: [], failed: [] };
    promiseResponses.forEach((prom, index) => {
      if (prom.status === 'fulfilled') result.successful.push(prom.value);
      else result.failed.push(snippetIDs[index]);
    });

    return result;
  }

  @BubbleUnexpectedError()
  async getAllVersionsOfSnippet(
    snippetId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getAllVersionsOfSnippet,
        pathParameters: { id: snippetId },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async getAllSnippetsOfWorkspace(
    workspaceId: string,
    idToken: string,
    getData = false
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getAllSnippetsOfWorkspace,
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        queryStringParameters: { getData },
      }
    );

    response.forEach(item => {
      item.template = !!(item.template === 'true');
    });

    return response;
  }

  @BubbleUnexpectedError()
  async makeSnippetPublic(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.makeSnippetPublic,
        pathParameters: { id: snippetId, version },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async makeSnippetPrivate(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.makeSnippetPrivate,
        pathParameters: { id: snippetId, version },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async getPublicSnippet(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getPublicSnippet,
        pathParameters: { id: snippetId, version },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async clonePublicSnippet(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.clonePublicSnippet,
        pathParameters: { id: snippetId, version },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async deleteVersionOfSnippet(
    snippetID: string,
    workspaceID: string,
    idToken: string,
    version?: number
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.deleteVersionOfSnippet,
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
        pathParameters: { id: snippetID },
        ...(version && { queryStringParameters: { version: version } }),
      }
    );

    return response;
  }

  @BubbleUnexpectedError()
  async deleteAllVersionsOfSnippet(
    snippetID: string,
    workspaceID: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.deleteAllVersionsOfSnippet,
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
        pathParameters: { id: snippetID },
      }
    );

    return response;
  }

  @BubbleUnexpectedError()
  async updateSnippetMetadata(
    workspaceID: string,
    idToken: string,
    snippetID: string,
    payload: any
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.updateSnippetMetadata,
        pathParameters: { id: snippetID },
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
        payload: { ...payload, type: 'MetadataRequest' },
      }
    );

    return result;
  }
}
