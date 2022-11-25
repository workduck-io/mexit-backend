/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';
import { STAGE } from '../env';
import { ArchiveNodeDetail, CopyOrMoveBlock } from '../interfaces/Node';
import { BulkResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class NodeManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _nodeLambdaFunctionName = `mex-backend-${STAGE}-Node`;
  private _workspaceLambdaFunctionName = `mex-backend-${STAGE}-Workspace`;
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async createNode(
    workspaceId: string,
    idToken: string,
    nodeDetail: any
  ): Promise<any> {
    try {
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

  async getNode(
    nodeId: string,
    workspaceId: string,
    idToken: string,
    queryParams?: any
  ): Promise<any> {
    try {
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

  async getMultipleNode(
    nodeids: string[],
    workspaceId: string,
    idToken: string,
    namespaceID?: string
  ): Promise<BulkResponse<any>> {
    try {
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

  async appendNode(
    nodeId: string,
    workspaceId: string,
    idToken: string,
    block: any
  ) {
    try {
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

  async deleteBlocks(
    workspaceId: string,
    idToken: string,
    nodeBlockMap: Record<string, string[]>
  ) {
    try {
      const promises = Object.entries(nodeBlockMap).map(
        ([nodeId, blockIds]) => {
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
        }
      );
      const result = await Promise.allSettled(promises);
      console.error(result.filter(res => res.status === 'rejected'));
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

  async moveBlocks(
    blockId: string,
    sourceNodeId: string,
    destinationNodeId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
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

  async makeNodePublic(
    nodeId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
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

  async makeNodePrivate(
    nodeId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
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

  async getPublicNode(nodeId: string, idToken: string): Promise<any> {
    try {
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

  async archiveNode(
    workspaceId: string,
    idToken: string,
    archivePayload: ArchiveNodeDetail,
    namespaceID: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.archiveNode,
          payload: archivePayload,
          pathParameters: { id: namespaceID },
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

  async unArchiveNode(
    workspaceId: string,
    idToken: string,
    unArchivePayload: ArchiveNodeDetail
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.unArchiveNode,
          payload: unArchivePayload,
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

  async deletedArchivedNode(
    workspaceId: string,
    idToken: string,
    deleteArchivePayload: ArchiveNodeDetail
  ): Promise<any> {
    try {
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

  async refactorHierarchy(workspaceId: string, idToken: string, payload: any) {
    try {
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

  async bulkCreateNode(workspaceId: string, idToken: string, payload: any) {
    try {
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

  async getArchivedNodes(workspaceId: string, idToken: string) {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getArchivedNodes,
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
}
