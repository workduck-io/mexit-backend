import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { STAGE } from '../env';

@injectable()
export class LinkManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _linkServiceLambdaBase = `mex-url-shortner-${STAGE}`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async createNewShort(
    workspaceID: string,
    idToken: string,
    data: any
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        `${this._linkServiceLambdaBase}-shorten`,
        this._lambdaInvocationType,
        {
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

  async getAllShortsOfWorkspace(
    workspaceID: string,
    idToken: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        `${this._linkServiceLambdaBase}-workspaceDetails`,
        this._lambdaInvocationType,
        {
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

  async deleteShort(
    workspaceID: string,
    idToken: string,
    url: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        `${this._linkServiceLambdaBase}-del`,
        this._lambdaInvocationType,
        {
          httpMethod: 'DELETE',
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          pathParameters: { url: url },
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

  async getStatsByURL(
    workspaceID: string,
    idToken: string,
    url: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        `${this._linkServiceLambdaBase}-stats`,
        this._lambdaInvocationType,
        {
          httpMethod: 'GET',
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          pathParameters: { url: url },
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
