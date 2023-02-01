/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';
import { STAGE } from '../env';
import { ArchiveNodeDetail, CopyOrMoveBlock } from '../interfaces/Node';
import { BulkResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class NodeManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _nodeLambdaFunctionName = `mex-backend-${STAGE}-Node`;
  private _workspaceLambdaFunctionName = `mex-backend-${STAGE}-Workspace`;
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async createNode(
    workspaceId: string,
    idToken: string,
    nodeDetail: any
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.createNode,
        payload: { ...nodeDetail, type: 'NodeRequest' },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async getNode(
    nodeId: string,
    workspaceId: string,
    idToken: string,
    queryParams?: any
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getNode,
        pathParameters: { id: nodeId },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        ...(queryParams && { queryStringParameters: queryParams }),
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async getMultipleNode(
    nodeids: string[],
    workspaceId: string,
    idToken: string,
    namespaceID?: string
  ): Promise<BulkResponse<any>> {
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getMultipleNode,
        payload: { ids: nodeids },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
        ...(namespaceID && {
          queryStringParameters: { namespaceID: namespaceID },
        }),
      }
    );

    const fetchedIDs = new Set(result.map(node => node.id));
    const failedIDs = nodeids.filter(id => !fetchedIDs.has(id));

    return { successful: result, failed: failedIDs };
  }

  @BubbleUnexpectedError()
  async appendNode(
    nodeId: string,
    workspaceId: string,
    idToken: string,
    block: any
  ) {
    const response = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.appendNode,
        payload: { ...block, type: 'ElementRequest' },
        pathParameters: { id: nodeId },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return response;
  }

  @BubbleUnexpectedError()
  async deleteBlocks(
    workspaceId: string,
    idToken: string,
    nodeBlockMap: Record<string, string[]>
  ) {
    const promises = Object.entries(nodeBlockMap).map(([nodeId, blockIds]) => {
      return this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.deleteBlocks,
          payload: { ids: blockIds },
          pathParameters: { id: nodeId },
          headers: {
            'mex-workspace-id': workspaceId,
            authorization: idToken,
          },
        }
      );
    });
    const result = await Promise.allSettled(promises);
    console.error(result.filter(res => res.status === 'rejected'));
    return result;
  }

  @BubbleUnexpectedError()
  async moveBlocks(
    blockId: string,
    sourceNodeId: string,
    destinationNodeId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const payload: CopyOrMoveBlock = {
      action: 'move',
      type: 'BlockMovementRequest',
      blockID: blockId,
      destinationNodeID: destinationNodeId,
      sourceNodeID: sourceNodeId,
    };
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.copyOrMoveBlock,
        payload: payload,
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async makeNodePublic(
    nodeId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
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

  @BubbleUnexpectedError()
  async makeNodePrivate(
    nodeId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    const response = await this._lambda.invokeAndCheck(
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

  @BubbleUnexpectedError()
  async getPublicNode(nodeId: string, idToken: string): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getPublicNode,
        pathParameters: { id: nodeId },
        headers: {
          'mex-workspace-id': '',
          authorization: idToken,
        },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async archiveNode(
    workspaceId: string,
    idToken: string,
    archivePayload: ArchiveNodeDetail,
    namespaceID: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.archiveNode,
        payload: archivePayload,
        queryStringParameters: { namespaceID: namespaceID },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async unArchiveNode(
    workspaceId: string,
    idToken: string,
    unArchivePayload: ArchiveNodeDetail,
    namespaceID: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.unArchiveNode,
        payload: unArchivePayload,
        queryStringParameters: { namespaceID: namespaceID },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async deletedArchivedNode(
    workspaceId: string,
    idToken: string,
    deleteArchivePayload: ArchiveNodeDetail
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.deleteArchivedNode,
        payload: deleteArchivePayload,
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async refactorHierarchy(workspaceId: string, idToken: string, payload: any) {
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.refactorHierarchy,
        payload: { ...payload, type: 'RefactorRequest' },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async bulkCreateNode(workspaceId: string, idToken: string, payload: any) {
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.bulkCreateNode,
        payload: { ...payload, type: 'NodeBulkRequest' },
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async getArchivedNodes(workspaceId: string, idToken: string) {
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getArchivedNodes,
        headers: { 'mex-workspace-id': workspaceId, authorization: idToken },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async updateNodeMetadata(
    workspaceID: string,
    idToken: string,
    nodeID: string,
    payload: any
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._nodeLambdaFunctionName,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.updateNodeMetadata,
        pathParameters: { id: nodeID },
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
        payload: { ...payload, type: 'MetadataRequest' },
      }
    );

    return result;
  }
}
