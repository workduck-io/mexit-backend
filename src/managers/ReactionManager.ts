import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class ReactionManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _reactionLambdaName = `reaction-${STAGE}-main`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async getReactionsOfNode(
    workspaceID: string,
    idToken: string,
    nodeID: string
  ): Promise<any> {
    try {
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

  async getReactionsOfBlock(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string
  ): Promise<any> {
    try {
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

  async getReactionDetailsOfBlock(
    workspaceID: string,
    idToken: string,
    nodeId: string,
    blockId: string
  ): Promise<any> {
    try {
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

  async toggleReaction(
    workspaceID: string,
    idToken: string,
    data: any
  ): Promise<any> {
    try {
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
