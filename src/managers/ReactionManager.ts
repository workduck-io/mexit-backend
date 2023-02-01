import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class ReactionManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _reactionLambdaName = `reaction-${STAGE}-main`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async getReactionsOfNode(
    workspaceID: string,
    idToken: string,
    nodeID: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._reactionLambdaName,
      this._lambdaInvocationType,
      {
        httpMethod: 'GET',
        routeKey: RouteKeys.getAllReactionsOfNode,
        pathParameters: { nodeId: nodeID },
        headers: {
          'mex-workspace-id': workspaceID,
          authorization: idToken,
          'mex-api-ver': 'v2',
        },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async getReactionsOfBlock(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._reactionLambdaName,
      this._lambdaInvocationType,
      {
        httpMethod: 'GET',
        routeKey: RouteKeys.getAllReactionsOfBlock,
        pathParameters: { nodeId, blockId },
        headers: {
          'mex-workspace-id': workspaceID,
          authorization: idToken,
          'mex-api-ver': 'v2',
        },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async getReactionDetailsOfBlock(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._reactionLambdaName,
      this._lambdaInvocationType,
      {
        httpMethod: 'GET',
        routeKey: RouteKeys.getReactionDetailsOfBlock,
        pathParameters: { nodeId, blockId },
        headers: {
          'mex-workspace-id': workspaceID,
          authorization: idToken,
          'mex-api-ver': 'v2',
        },
      }
    );
    return result;
  }

  @BubbleUnexpectedError()
  async toggleReaction(
    workspaceID: string,
    idToken: string,
    data: any
  ): Promise<any> {
    const result = this._lambda.invokeAndCheck(
      this._reactionLambdaName,
      this._lambdaInvocationType,
      {
        httpMethod: 'POST',
        routeKey: RouteKeys.toggleReaction,
        payload: data,
        headers: {
          'mex-workspace-id': workspaceID,
          authorization: idToken,
          'mex-api-ver': 'v2',
        },
      },
      true
    );
    return result;
  }
}
