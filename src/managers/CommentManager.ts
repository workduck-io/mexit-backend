import { injectable } from 'inversify';

import { STAGE } from '../env';
import { Comment } from '../interfaces/Request';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class CommentManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _commentLambdaName = `comment-${STAGE}-main`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async getCommentByID(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    entityId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._commentLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          routeKey: RouteKeys.getCommentByID,
          pathParameters: { entityId: entityId, nodeId: nodeId },
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

  async createComment(
    workspaceID: string,
    idToken: string,
    data: Comment
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._commentLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'POST',
          routeKey: RouteKeys.createComment,
          payload: data,
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
        },
        true
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

  async deleteCommentByID(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    entityId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._commentLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'DELETE',
          routeKey: RouteKeys.deleteCommentByID,
          pathParameters: { entityId: entityId, nodeId: nodeId },
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

  async getAllCommentsOfNode(
    workspaceID: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._commentLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          routeKey: RouteKeys.getAllCommentsOfNode,
          pathParameters: { nodeId: nodeId },
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

  async getAllCommentsOfBlock(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._commentLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          routeKey: RouteKeys.getAllCommentsOfBlock,
          pathParameters: { nodeId, blockId },
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

  async getAllCommentsOfBlocks(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockIds: string[]
  ): Promise<any> {
    try {
      const requests = blockIds.map(blockId =>
        this._lambda.invokeAndCheck(
          this._commentLambdaName,
          this._lambdaInvocationType,
          {
            httpMethod: 'GET',
            routeKey: RouteKeys.getAllCommentsOfBlock,
            pathParameters: { nodeId, blockId },
            headers: {
              'mex-workspace-id': workspaceID,
              authorization: idToken,
            },
          }
        )
      );
      const result = await Promise.allSettled(requests);

      return {
        successful: result
          .filter(p => p.status === 'fulfilled')
          .map((p: PromiseFulfilledResult<any>) => p.value),
        failed: result.filter(p => p.status === 'rejected'),
      };
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

  async getAllCommentsOfThread(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string,
    threadId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._commentLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          routeKey: RouteKeys.getAllCommentsOfThread,
          pathParameters: { nodeId, blockId, threadId },
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

  async deleteAllCommentsOfNode(
    workspaceID: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._commentLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'DELETE',
          routeKey: RouteKeys.deleteAllCommentsOfNode,
          pathParameters: { nodeId: nodeId },
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

  async deleteAllCommentsOfBlock(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._commentLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'DELETE',
          routeKey: RouteKeys.deleteAllCommentsOfBlock,
          pathParameters: { nodeId, blockId },
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

  async deleteAllCommentsOfThread(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string,
    threadId: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._commentLambdaName,
        this._lambdaInvocationType,
        {
          httpMethod: 'DELETE',
          routeKey: RouteKeys.deleteAllCommentsOfThread,
          pathParameters: { nodeId, blockId, threadId },
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
