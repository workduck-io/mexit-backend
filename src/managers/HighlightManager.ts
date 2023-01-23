import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class HighlightManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _highlightServiceLambdaName = `highlights-${STAGE}-main`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async createHighlight(
    workspaceID: string,
    idToken: string,
    data: any
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._highlightServiceLambdaName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.createHighlight,
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          httpMethod: 'POST',
          payload: data,
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

  async getMultipleHighlights(
    workspaceID: string,
    idToken: string,
    ids: string[]
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._highlightServiceLambdaName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getHighlightByIDs,
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          httpMethod: 'POST',
          payload: { ids },
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

  async getAllHighlightsOfWorkspace(
    workspaceID: string,
    idToken: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._highlightServiceLambdaName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllHighlightsOfWorkspace,
          httpMethod: 'GET',
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

  async deleteHighlight(
    workspaceID: string,
    idToken: string,
    id: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._highlightServiceLambdaName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.deleteHighlightByID,
          httpMethod: 'DELETE',
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          pathParameters: { entityId: id },
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
