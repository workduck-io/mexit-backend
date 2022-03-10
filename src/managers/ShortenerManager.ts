import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
import container from '../inversify.config';
import { Lambda, InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { LinkCapture } from '../interfaces/Node';
@injectable()
export class ShortenerManager {
  private _lambdaInvocationType: InvocationType = 'RequestResponse';
  private _getShortsLambdaFunctionName = 'mex-integration-dev-namespaceDetails';
  private _createShortLambdaFunctionName = 'mex-integration-dev-shorten';

  private _lambda: Lambda = container.get<Lambda>(Lambda);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getStatsByWorkspace(namespace: string): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._getShortsLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getShorts,
          pathParameters: { namespace: namespace },
        }
      );
      return result.body;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createNewShort(data: LinkCapture): Promise<any> {
    try {
      const result = await this._lambda.invoke(
        this._createShortLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.shorten,
          payload: data,
        },
        true
      );

      return result.body;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
}
