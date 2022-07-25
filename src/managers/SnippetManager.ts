/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';
import { errorlib } from '../libs/errorlib';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { STAGE } from '../env';

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
}
