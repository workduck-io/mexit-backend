import { injectable } from 'inversify';

import { errorlib } from '../libs/errorlib';
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

  async getStatsByWorkspace(namespace: string): Promise<any> {
    try {
      const result = await this._lambda.invokeAndCheck(
        this._getShortsLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.getShorts,
          pathParameters: { namespace: namespace },
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

  async createNewShort(data: LinkCapture): Promise<any> {
    try {
      delete data['linkNodeID'];
      const result = await this._lambda.invokeAndCheck(
        this._createShortLambdaFunctionName,
        this._lambdaInvocationType,
        {
          routeKey: RouteKeys.shorten,
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
}
