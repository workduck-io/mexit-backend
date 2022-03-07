/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';
import {
  ActivityNodeDetail,
  CopyOrMoveBlock,
  NodeDetail,
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
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async createNode(
    workspaceId: string,
    nodeDetail: NodeDetail | ActivityNodeDetail
  ): Promise<string> {
    try {
      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.createNode,
          payload: nodeDetail,
          headers: { 'workspace-id': workspaceId },
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
          headers: { 'workspace-id': workspaceId },
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
          headers: { 'workspace-id': workspaceId },
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAllNodes(userId: string, workspaceId: string): Promise<any> {
    try {
      const response = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllNodes,
          pathParameters: { id: userId },
          headers: { 'workspace-id': workspaceId },
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
    workspaceId: string
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
          headers: { 'workspace-id': workspaceId },
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
}
