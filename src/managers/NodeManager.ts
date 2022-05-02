/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';
import {
  ArchiveNodeDetail,
  CopyOrMoveBlock,
  ShareNodeDetail,
} from '../interfaces/Node';
import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';

@injectable()
export class NodeManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _nodeLambdaFunctionName = 'mex-backend-test-Node';
  private _workspaceLambdaFunctionName = 'mex-backend-test-Workspace';
  private _tagLambdaFunctionName = 'mex-backend-test-Tag';
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async createNode(
    workspaceId: string,
    idToken: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodeDetail: any
  ): Promise<string> {
    try {
      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.createNode,
          payload: nodeDetail,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
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

  async getNode(
    nodeId: string,
    workspaceId: string,
    idToken: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryParams?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getNode,
          pathParameters: { id: nodeId },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
          ...(queryParams && { queryStringParameters: queryParams }),
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

  async appendNode(
    nodeId: string,
    workspaceId: string,
    idToken: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    block: any
  ): Promise<string> {
    try {
      const response = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.appendNode,
          payload: block,
          pathParameters: { id: nodeId },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );

      return response.body;
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
  async getAllNodes(
    userId: string,
    workspaceId: string,
    idToken: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    try {
      const response = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllNodes,
          pathParameters: { id: userId },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );
      const result: string = response.body;

      if (result.includes('message')) {
        return JSON.parse(result);
      } else if (result.length === 2 && result[0] === '[' && result[1] === ']')
        return [];
      else {
        let allNodes = result.replace('[', '');
        allNodes = allNodes.replace(']', '');
        allNodes = allNodes.replace(/"/g, '');
        return allNodes.split(',');
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
  async moveBlocks(
    blockId: string,
    sourceNodeId: string,
    destinationNodeId: string,
    workspaceId: string,
    idToken: string
  ): Promise<string> {
    try {
      const payload: CopyOrMoveBlock = {
        action: 'move',
        type: 'BlockMovementRequest',
        blockID: blockId,
        destinationNodeID: destinationNodeId,
        sourceNodeID: sourceNodeId,
      };
      const response = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.copyOrMoveBlock,
          payload: payload,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );
      return response.body;
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
  async makeNodePublic(
    nodeId: string,
    workspaceId: string,
    idToken: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const response = await this._lambda.invoke(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.makeNodePublic,
        pathParameters: { id: nodeId },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }
  async makeNodePrivate(
    nodeId: string,
    workspaceId: string,
    idToken: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const response = await this._lambda.invoke(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.makeNodePrivate,
        pathParameters: { id: nodeId },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }
  async getPublicNode(
    nodeId: string,
    workspaceId: string,
    idToken: string
  ): Promise<string> {
    try {
      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getPublicNode,
          pathParameters: { id: nodeId },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );

      const response: string = result.body;
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
  async getLinkHierarchy(
    workspaceId: string,
    idToken: string
  ): Promise<string[]> {
    try {
      const result = await this._lambda.invoke(
        this._workspaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getLinkHierarchy,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );

      const response: string = result.body;
      let allNodes = response.replace('[', '');
      allNodes = allNodes.replace(']', '');
      allNodes = allNodes.replace(/"/g, '');
      const linkResponse = allNodes.split(',');
      return linkResponse;
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

  async archiveNode(
    workspaceId: string,
    idToken: string,
    archivePayload: ArchiveNodeDetail
  ): Promise<string[]> {
    try {
      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.archiveNode,
          payload: archivePayload,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );

      const response: string = result.body;
      let allNodes = response.replace('[', '');
      allNodes = allNodes.replace(']', '');
      allNodes = allNodes.replace(/"/g, '');
      const linkResponse = allNodes.split(',');
      return linkResponse;
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
  async unArchiveNode(
    workspaceId: string,
    idToken: string,
    unArchivePayload: ArchiveNodeDetail
  ): Promise<string[]> {
    try {
      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.unArchiveNode,
          payload: unArchivePayload,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );

      const response: string = result.body;

      if (!response) throw new Error('Something went wrong');

      let allNodes = response.replace('[', '');
      allNodes = allNodes.replace(']', '');
      allNodes = allNodes.replace(/"/g, '');
      const linkResponse = allNodes.split(',');
      return linkResponse;
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

  async shareNode(
    workspaceId: string,
    idToken: string,
    shareNodePayload: ShareNodeDetail
  ): Promise<void> {
    try {
      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.shareNode,
          payload: {
            ...shareNodePayload,
            nodeID: shareNodePayload.nodeId,
            userIDs: shareNodePayload.userIds,
          },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );

      console.log({ result });
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
  async updateAccessTypeForSharedNode(
    workspaceId: string,
    idToken: string,
    shareNodePayload: ShareNodeDetail
  ): Promise<void> {
    try {
      await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.updateAccessTypeForshareNode,
          payload: {
            ...shareNodePayload,
            nodeID: shareNodePayload.nodeId,
            userIDs: shareNodePayload.userIds,
          },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );
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
  async revokeNodeAccessForUsers(
    workspaceId: string,
    idToken: string,
    shareNodePayload: ShareNodeDetail
  ): Promise<void> {
    try {
      await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.revokeNodeAccessForUsers,
          payload: {
            ...shareNodePayload,
            nodeID: shareNodePayload.nodeId,
            userIDs: shareNodePayload.userIds,
          },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );
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
  async getNodeSharedWithUser(
    workspaceId: string,
    idToken: string,
    nodeId: string
  ): Promise<void> {
    try {
      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getNodeSharedWithUser,
          pathParameters: { nodeID: nodeId },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );
      return result;
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
  async getAllTagsOfWorkspace(
    workspaceId: string,
    idToken: string
  ): Promise<string[]> {
    try {
      const result = await this._lambda.invoke(
        this._tagLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllTagsOfWorkspace,
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );

      const response: string = result.body;

      if (!response) throw new Error('Something went wrong');

      let allNodes = response.replace('[', '');
      allNodes = allNodes.replace(']', '');
      allNodes = allNodes.replace(/"/g, '');
      const nodeResponse = allNodes.split(',');
      return nodeResponse;
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
  async getNodeWithTag(
    workspaceId: string,
    idToken: string,
    tagName: string
  ): Promise<string[]> {
    try {
      const result = await this._lambda.invoke(
        this._tagLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getNodeWithTag,
          pathParameters: { tagName: tagName },
          headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        }
      );
      const response: string = result.body;

      if (!response) throw new Error('Something went wrong');

      let allNodes = response.replace('[', '');
      allNodes = allNodes.replace(']', '');
      allNodes = allNodes.replace(/"/g, '');
      const nodeResponse = allNodes.split(',');
      return nodeResponse;
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
}
