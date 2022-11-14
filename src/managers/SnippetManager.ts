/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';
import { STAGE } from '../env';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class SnippetManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _snippetLambdaFunctionName = `mex-backend-${STAGE}-Snippet`;
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async createSnippet(
    workspaceId: string,
    idToken: string,
    snippetDetail: any,
    createNextVersion = false
  ): Promise<any> {
    try {
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

  async getSnippet(
    snippetId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
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

  async bulkGetSnippet(
    snippetIDs: string[],
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
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

      const result = promiseResponses
        .filter(snippet => snippet.status === 'fulfilled')
        .map((item: PromiseFulfilledResult<any>) => item.value);

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

  async getAllVersionsOfSnippet(
    snippetId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
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

  async getAllSnippetsOfWorkspace(
    workspaceId: string,
    idToken: string,
    getData = false
  ): Promise<any> {
    try {
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

  async makeSnippetPublic(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
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

  async makeSnippetPrivate(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
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

  async getPublicSnippet(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
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

  async clonePublicSnippet(
    snippetId: string,
    version: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
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

  async deleteVersionOfSnippet(
    snippetID: string,
    workspaceID: string,
    idToken: string,
    version?: number
  ): Promise<any> {
    try {
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

  async deleteAllVersionsOfSnippet(
    snippetID: string,
    workspaceID: string,
    idToken: string
  ): Promise<any> {
    try {
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
