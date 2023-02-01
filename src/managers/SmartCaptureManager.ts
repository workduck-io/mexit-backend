import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { BubbleUnexpectedError } from '../utils/decorators';

@injectable()
export class SmartCaptureManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _smartCaptureLambdaName = `smartcapture-${STAGE}-config`;

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  @BubbleUnexpectedError()
  async getPublicConfig(workspaceID: string, idToken: string): Promise<any> {
    const result = await this._lambda.invokeAndCheck(
      this._smartCaptureLambdaName,
      this._lambdaInvocationType,
      {
        httpMethod: 'GET',
        routeKey: RouteKeys.getPublicCaptureConfig,
        headers: {
          'mex-workspace-id': workspaceID,
          authorization: idToken,
        },
      }
    );
    return result;
  }
}
