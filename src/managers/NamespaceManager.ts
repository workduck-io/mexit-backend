import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { STAGE } from '../env';

@injectable()
export class NamespaceManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _namespaceLambdaFunctionName = `mex-backend-${STAGE}-Namespace`;
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async createNamespace(
    workspaceId: string,
    idToken: string,
    namespaceDetail: { name: string }
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._namespaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.createNamespace,
          payload: { ...namespaceDetail, type: 'NamespaceRequest' },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
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

  async getNamespace(
    workspaceId: string,
    idToken: string,
    namespaceId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._namespaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getNamespace,
          pathParameters: { id: namespaceId },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
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

  async updateNamespace(
    workspaceId: string,
    idToken: string,
    namespaceDetail: { name: string }
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._namespaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.updateNamespace,
          payload: { ...namespaceDetail, type: 'NamespaceRequest' },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
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

  async makeNamespacePublic(
    workspaceId: string,
    idToken: string,
    namespaceId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._namespaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.makeNamespacePublic,
          pathParameters: { id: namespaceId },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
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

  async makeNamespacePrivate(
    workspaceId: string,
    idToken: string,
    namespaceId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._namespaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.makeNamespacePrivate,
          pathParameters: { id: namespaceId },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
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

  async getPublicNamespace(idToken: string, namespaceId: string): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._namespaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getPublicNamespace,
          pathParameters: { id: namespaceId },
          headers: { 'mex-workspace-id': '', authorization: idToken },
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

  async getAllNamespaces(workspaceID: string, idToken: string): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._namespaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllNamespaces,
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
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

  async getAllNamespaceHierarchy(
    workspaceId: string,
    idToken: string,
    getMetadata = false
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._namespaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllNamespaceHierarchy,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
          queryStringParameters: { getMetadata: getMetadata },
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

  async shareNamespace(
    workspaceID: string,
    idToken: string,
    body: any
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._namespaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.shareNamespace,
          payload: { ...body, type: 'SharedNamespaceRequest' },
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
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

  async revokeAccessFromNamespace(
    workspaceID: string,
    idToken: string,
    body: any
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._namespaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.revokeUserAccessFromNamespace,
          payload: { ...body, type: 'SharedNamespaceRequest' },
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
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

  async getUsersOfSharedNamespace(
    workspaceID: string,
    idToken: string,
    namespaceID: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._namespaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getUsersOfSharedNamespace,
          pathParameters: { id: namespaceID },
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
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
}
