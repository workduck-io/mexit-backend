/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';
import { NodeDetail } from '../interfaces/Node';
import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';

@injectable()
export class SnippetManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _snippetLambdaFunctionName = 'mex-backend-test-Snippet';
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async createSnippet(
    workspaceId: string,
    idToken: string,
    snippetDetail: NodeDetail,
    createNextVersion = false
  ): Promise<string> {
    try {
      const result = await this._lambda.invoke(
        this._snippetLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.createSnippet,
          payload: snippetDetail,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
          queryStringParameters: { createNextVersion },
        }
      );

      return result.body;
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

  async getSnippet(
    snippetId: string,
    workspaceId: string,
    idToken: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._snippetLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getSnippet,
          pathParameters: { id: snippetId },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );

      const response: string = result.body;

      if (response.includes('message')) return JSON.parse(response);

      return response;
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
  async getAllVersionsOfSnippet(
    snippetId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const response = await this._lambda.invoke(
        this._snippetLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllVersionsOfSnippet,
          pathParameters: { id: snippetId },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );
      const result: string = response.body;

      if (result.includes('message')) {
        return JSON.parse(result);
      } else if (result.length === 2 && result[0] === '[' && result[1] === ']')
        return [];
      else {
        let allVersions = result.replace('[', '');
        allVersions = allVersions.replace(']', '');
        allVersions = allVersions.replace(/"/g, '');
        return allVersions.split(',');
      }
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

  async makeSnippetPublic(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invoke(
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

  async makeSnippetPrivate(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invoke(
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

  async getPublicSnippet(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const result = await this._lambda.invoke(
      this._snippetLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getPublicSnippet,
        pathParameters: { id: snippetId, version },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    const response: string = result.body;
    return response;
  }

  async clonePublicSnippet(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invoke(
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
}
