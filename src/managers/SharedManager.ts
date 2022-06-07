/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import {
  NodeDetail,
  ShareNodeDetail,
  UpdateAccessTypeForSharedNodeDetail,
} from '../interfaces/Node';

@injectable()
export class SharedManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _nodeLambdaFunctionName = 'mex-backend-test-Node';
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async shareNode(
    workspaceId: string,
    idToken: string,
    shareNodePayload: ShareNodeDetail
  ): Promise<string> {
    try {
      const payloadDetail = {
        ...shareNodePayload,
        nodeID: shareNodePayload.nodeId,
        userIDs: shareNodePayload.userIds,
      };
      delete payloadDetail.nodeId;
      delete payloadDetail.userIds;

      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.shareNode,
          payload: payloadDetail,
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
  async updateAccessTypeForSharedNode(
    workspaceId: string,
    idToken: string,
    updatedAccessTypeForSharedNodePayload: UpdateAccessTypeForSharedNodeDetail
  ): Promise<string> {
    try {
      const payloadDetail = {
        ...updatedAccessTypeForSharedNodePayload,
        nodeID: updatedAccessTypeForSharedNodePayload.nodeId,
      };
      delete payloadDetail.nodeId;

      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.updateAccessTypeForshareNode,
          payload: payloadDetail,
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
  async revokeNodeAccessForUsers(
    workspaceId: string,
    idToken: string,
    shareNodePayload: ShareNodeDetail
  ): Promise<string> {
    try {
      const result = await this._lambda.invoke(
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
  async getNodeSharedWithUser(
    workspaceId: string,
    idToken: string,
    nodeId: string
  ): Promise<string> {
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

  async updateSharedNode(
    workspaceId: string,
    idToken: string,
    nodeDetail: NodeDetail
  ): Promise<string> {
    try {
      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.updateSharedNode,
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
  async getUserWithNodesShared(
    workspaceId: string,
    idToken: string,
    nodeId: string
  ): Promise<string> {
    try {
      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getUsersWithNodesShared,
          pathParameters: { id: nodeId },
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
  async getAllNodesSharedForUser(
    workspaceId: string,
    idToken: string
  ): Promise<string> {
    try {
      const result = await this._lambda.invoke(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllSharedNodeForUser,
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
}
