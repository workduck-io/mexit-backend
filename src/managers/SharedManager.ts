/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import {
  NodeDetail,
  ShareNodeDetail,
  UpdateAccessTypeForSharedNodeDetail,
  UpdateShareNodeDetail,
} from '../interfaces/Node';
import { STAGE } from '../env';
import { BulkResponse } from '../interfaces/Response';

@injectable()
export class SharedManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _nodeLambdaFunctionName = `mex-backend-${STAGE}-Node`;
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async shareNode(
    workspaceId: string,
    idToken: string,
    shareNodePayload: ShareNodeDetail
  ): Promise<any> {
    try {
      const payloadDetail = {
        ...shareNodePayload,
        nodeID: shareNodePayload.nodeID,
        userIDs: shareNodePayload.userIDs,
      };

      // delete payloadDetail.nodeID;
      // delete payloadDetail.userIDs;

      const response = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.shareNode,
          payload: payloadDetail,
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
  async updateAccessTypeForSharedNode(
    workspaceId: string,
    idToken: string,
    updatedAccessTypeForSharedNodePayload: UpdateAccessTypeForSharedNodeDetail
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.updateAccessTypeForshareNode,
          payload: {
            ...updatedAccessTypeForSharedNodePayload,
            type: 'UpdateAccessTypesRequest',
          },
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
  async revokeNodeAccessForUsers(
    workspaceId: string,
    idToken: string,
    shareNodePayload: ShareNodeDetail
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.revokeNodeAccessForUsers,
          payload: {
            ...shareNodePayload,
            nodeID: shareNodePayload.nodeID,
            userIDs: shareNodePayload.userIDs,
          },
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
  async getNodeSharedWithUser(
    workspaceId: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getNodeSharedWithUser,
          pathParameters: { nodeID: nodeId },
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
  async updateSharedNode(
    workspaceId: string,
    idToken: string,
    nodeDetail: UpdateShareNodeDetail
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.updateSharedNode,
          payload: { ...nodeDetail, type: 'UpdateSharedNodeRequest' },
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
  async getUserWithNodesShared(
    workspaceId: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getUsersWithNodesShared,
          pathParameters: { id: nodeId },
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
  async getAllNodesSharedForUser(
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const response = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllSharedNodeForUser,
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

  async bulkGetSharedNodes(
    nodeIDs: string[],
    workspaceID: string,
    idToken: string
  ): Promise<BulkResponse<any>> {
    try {
      const lambdaPromises = nodeIDs.map(id =>
        this._lambda.invokeAndCheck(
          this._nodeLambdaFunctionName,
          this._lambdaInvocationType,
          {
            routeKey: RouteKeys.getNodeSharedWithUser,
            pathParameters: { nodeID: id },
            headers: {
              'mex-workspace-id': workspaceID,
              authorization: idToken,
            },
          }
        )
      );

      const promiseResponse = await Promise.allSettled(lambdaPromises);
      const result = { successful: [], failed: [] };
      promiseResponse.forEach((prom, index) => {
        if (prom.status === 'fulfilled') result.successful.push(prom.value);
        else {
          console.log('Failure because: ', prom.reason);
          result.failed.push(nodeIDs[index]);
        }
      });

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
