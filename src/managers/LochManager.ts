import { injectable } from 'inversify';

import { WDError } from '@workduck-io/wderror';
import { STAGE } from '../env';
import {
  ConnectToLochService,
  UpdateParentNodeForLochService,
} from '../interfaces/Request';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class LochManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _mexLochLambdaBase = `mex-loch-${STAGE}`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async getAllServices(workspaceID: string, idToken: string): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      `${this._mexLochLambdaBase}-allConfig`,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getAllServices,
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async getConnectedServices(
    workspaceID: string,
    idToken: string
  ): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      `${this._mexLochLambdaBase}-connected`,
      this._lambdaInvocationType,
      {
        routeKey: RouteKeys.getConnectedServices,
        headers: { 'mex-workspace-id': workspaceID, authorization: idToken },
      }
    );

    return result;
  }

  @BubbleUnexpectedError()
  async connectToService(
    workspaceID: string,
    idToken: string,
    body: ConnectToLochService
  ): Promise<any> {
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
  }

  @BubbleUnexpectedError()
  async updateParentNoteOfConnected(
    workspaceID: string,
    idToken: string,
    body: UpdateParentNodeForLochService
  ): Promise<any> {
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
  }
}
