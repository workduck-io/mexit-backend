import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class NamespaceManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _namespaceLambdaFunctionName = `mex-backend-${STAGE}-Namespace`;
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async createNamespace(
    workspaceId: string,
    idToken: string,
    namespaceDetail: { name: string }
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.createNamespace,
        payload: { ...namespaceDetail, type: 'NamespaceRequest' },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async getNamespace(
    workspaceId: string,
    idToken: string,
    namespaceId: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.getNamespace,
        pathParameters: { id: namespaceId },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async updateNamespace(
    workspaceId: string,
    idToken: string,
    namespaceDetail: { name: string }
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.updateNamespace,
        payload: { ...namespaceDetail, type: 'NamespaceRequest' },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async makeNamespacePublic(
    workspaceId: string,
    idToken: string,
    namespaceId: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.makeNamespacePublic,
        pathParameters: { id: namespaceId },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async makeNamespacePrivate(
    workspaceId: string,
    idToken: string,
    namespaceId: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.makeNamespacePrivate,
        pathParameters: { id: namespaceId },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async getPublicNamespace(idToken: string, namespaceId: string): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.getPublicNamespace,
        pathParameters: { id: namespaceId },
        headers: { 'mex-workspace-id': '', authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async getAllNamespaces(workspaceID: string, idToken: string): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.getAllNamespaces,
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async getAllNamespaceHierarchy(
    workspaceId: string,
    idToken: string,
    getMetadata = false
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.getAllNamespaceHierarchy,
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        queryStringParameters: { getMetadata: getMetadata },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async shareNamespace(
    workspaceID: string,
    idToken: string,
    body: any
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.shareNamespace,
        payload: { ...body, type: 'SharedNamespaceRequest' },
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async revokeAccessFromNamespace(
    workspaceID: string,
    idToken: string,
    body: any
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.revokeUserAccessFromNamespace,
        payload: { ...body, type: 'SharedNamespaceRequest' },
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async getUsersOfSharedNamespace(
    workspaceID: string,
    idToken: string,
    namespaceID: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.getUsersOfSharedNamespace,
        pathParameters: { id: namespaceID },
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async getNodeIDFromPath(
    workspaceID: string,
    idToken: string,
    namespaceID: string,
    path: string,
    nodeID?: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.getNodeIDFromPath,
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
        pathParameters: { namespaceID: namespaceID, path: path },
        ...(nodeID && { queryStringParameters: { nodeID: nodeID } }),
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async deleteNamespace(
    workspaceID: string,
    idToken: string,
    namespaceID: string,
    successorNamespaceID?: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._namespaceLambdaFunctionName,

      {
        routeKey: RouteKeys.deleteNamespace,
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
        pathParameters: { id: namespaceID },
        ...(successorNamespaceID && {
          payload: {
            type: 'SuccessorNamespaceRequest',
            successorNamespaceID: successorNamespaceID,
            action: 'delete',
          },
        }),
      }
    );
    return result;
  }
}
