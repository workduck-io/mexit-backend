/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { injectable } from 'inversify';
import { ArchiveNodeDetail, CopyOrMoveBlock } from '../interfaces/Node';
import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import WDError from '../libs/WDError';
import { STAGE } from '../env';

@injectable()
export class NodeManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _nodeLambdaFunctionName = `mex-backend-${STAGE}-Node`;
  private _workspaceLambdaFunctionName = `mex-backend-${STAGE}-Workspace`;
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async getLinkHierarchy(workspaceId: string, idToken: string): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._workspaceLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getLinkHierarchy,
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
  async getAllNodes(
    userId: string,
    workspaceId: string,
    idToken: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllNodes,
          pathParameters: { id: userId },
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
    archivePayload: ArchiveNodeDetail
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._nodeLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.archiveNode,
          payload: archivePayload,
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
          pathParameters: { id: workspaceId },
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
