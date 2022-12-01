import { injectable } from 'inversify';

import { STAGE } from '../env';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { InvocationType, Lambda } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class SmartCaptureManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _smartCaptureLambdaName = `smartcapture-${STAGE}-config`;
  
  private _lambda: Lambda = container.get<Lambda>(Lambda);

  async getPublicConfig(workspaceID: string, idToken: string): Promise<any> {
    try {
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
