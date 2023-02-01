import { injectable } from 'inversify';

import { STAGE } from '../env';
import { Comment } from '../interfaces/Request';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class CommentManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _commentLambdaName = `comment-${STAGE}-main`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async getCommentByID(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    entityId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async createComment(
    workspaceID: string,
    idToken: string,
    data: Comment
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async deleteCommentByID(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    entityId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async getAllCommentsOfNode(
    workspaceID: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async getAllCommentsOfBlock(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async getAllCommentsOfBlocks(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockIds: string[]
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async getAllCommentsOfThread(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string,
    threadId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async deleteAllCommentsOfNode(
    workspaceID: string,
    idToken: string,
    nodeId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async deleteAllCommentsOfBlock(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async deleteAllCommentsOfThread(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string,
    threadId: string
  ): Promise<any> {
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
  }
}
