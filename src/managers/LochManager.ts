import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { STAGE } from '../env';
import {
  ConnectToLochService,
  UpdateParentNodeForLochService,
} from '../interfaces/Request';
import { WDError } from '@workduck-io/wderror';

@injectable()
export class LochManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _mexLochLambdaBase = `mex-loch-${STAGE}`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async getAllServices(workspaceID: string, idToken: string): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        `${this._mexLochLambdaBase}-allConfig`,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getAllServices,
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

  async getConnectedServices(
    workspaceID: string,
    idToken: string
  ): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        `${this._mexLochLambdaBase}-connected`,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getConnectedServices,
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

  async connectToService(
    workspaceID: string,
    idToken: string,
    body: ConnectToLochService
  ): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        `${this._mexLochLambdaBase}-register`,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.connectToService,
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          payload: body,
        }
      );

      if (result.statusCode === 400) {
        throw new WDError({
          message: result.body,
          statusCode: result.statusCode,
          code: result.statusCode,
        });
      }

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

  async updateParentNoteOfConnected(
    workspaceID: string,
    idToken: string,
    body: UpdateParentNodeForLochService
  ): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        `${this._mexLochLambdaBase}-update`,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.updateParentNodeOfService,
          headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
          payload: body,
        }
      );

      if (result.statusCode === 400) {
        throw new WDError({
          message: result.body,
          statusCode: result.statusCode,
          code: result.statusCode,
        });
      }

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
