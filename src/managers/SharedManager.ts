/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';

import { STAGE } from '../env';
import {
  ShareNodeDetail,
  UpdateAccessTypeForSharedNodeDetail,
  UpdateShareNodeDetail,
} from '../interfaces/Node';
import { BulkResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class SharedManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _nodeLambdaFunctionName = `mex-backend-${STAGE}-Node`;
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async shareNode(
    workspaceId: string,
    idToken: string,
    shareNodePayload: ShareNodeDetail
  ): Promise<any> {
    const payloadDetail = {
      ...shareNodePayload,
      nodeID: shareNodePayload.nodeID,
      userIDs: shareNodePayload.userIDs,
    };

    // delete payloadDetail.nodeID;
    // delete payloadDetail.userIDs;

    const response = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,

      {
        routeKey: RouteKeys.shareNode,
        payload: payloadDetail,
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async updateAccessTypeForSharedNode(
    workspaceId: string,
    idToken: string,
    updatedAccessTypeForSharedNodePayload: UpdateAccessTypeForSharedNodeDetail
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,

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
  }

  @BubbleUnexpectedError()
  async revokeNodeAccessForUsers(
    workspaceId: string,
    idToken: string,
    shareNodePayload: ShareNodeDetail
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,

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
  }

  @BubbleUnexpectedError()
  async getNodeSharedWithUser(
    workspaceId: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,

      {
        routeKey: RouteKeys.getNodeSharedWithUser,
        pathParameters: { nodeID: nodeId },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async updateSharedNode(
    workspaceId: string,
    idToken: string,
    nodeDetail: UpdateShareNodeDetail
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,

      {
        routeKey: RouteKeys.updateSharedNode,
        payload: { ...nodeDetail, type: 'UpdateSharedNodeRequest' },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async getUserWithNodesShared(
    workspaceId: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,

      {
        routeKey: RouteKeys.getUsersWithNodesShared,
        pathParameters: { id: nodeId },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async getAllNodesSharedForUser(
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,

      {
        routeKey: RouteKeys.getAllSharedNodeForUser,
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async bulkGetSharedNodes(
    nodeIDs: string[],
    workspaceID: string,
    idToken: string
  ): Promise<BulkResponse<any>> {
    const lambdaPromises = nodeIDs.map(id =>
      this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,

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
        console.error('Failure because: ', prom.reason);
        result.failed.push(nodeIDs[index]);
      }
    });

    return result;
  }
}
