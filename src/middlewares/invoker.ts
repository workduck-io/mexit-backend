import { NextFunction, Request, Response } from 'express';

import Config from '../config.json';
import { InvocationSource } from '../interfaces/Locals';
import { Destination } from '../interfaces/Request';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { GotClient } from '../libs/GotClientClass';
import { invokeAndCheck } from '../libs/LambdaInvoker';
import { APIGatewayRouteKeys, RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';
import { generateInvokePayload, InvokePayloadOptions } from '../utils/generatePayload';

const APIClient = container.get<GotClient>(GotClient);

async function InvokeLambda(req: Request, res: Response, next: NextFunction): Promise<void> {
  res.locals.invoker = async <T = any>(
    functionName: string,
    routeKey: keyof typeof RouteKeys,
    options?: InvokePayloadOptions<T>,
    sendRawBody = false,
    invocationSource: InvocationSource = 'APIGateway'
  ) => {
    try {
      if (options?.allSettled) {
        const promises = options.allSettled.ids.map(id => {
          const invokePayload = generateInvokePayload(
            res.locals,
            'Lambda',
            {
              ...options,
              pathParameters: {
                ...(options?.pathParameters ?? {}),
                [options?.allSettled?.key]: id,
              },
            },
            routeKey
          );
          return invokeAndCheck(functionName, 'RequestResponse', invokePayload, sendRawBody, invocationSource);
        });

        return await Promise.allSettled(promises);
      } else {
        const invokePayload = generateInvokePayload(res.locals, 'Lambda', options, routeKey);
        return await invokeAndCheck(functionName, 'RequestResponse', invokePayload, sendRawBody, invocationSource);
      }
    } catch (error: any) {
      console.log('Error: ', error);
      errorlib({
        message: error.message,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  };

  res.locals.gatewayInvoker = async <T = any>(
    routeKey,
    options?: InvokePayloadOptions<T>,
    ...args: string[]
  ): Promise<any> => {
    try {
      const { method, route, APIGateway } = APIGatewayRouteKeys[routeKey] as Destination;

      const additionalHeaders = { 'x-api-key': Config[APIGateway].token };
      const url = `${Config[APIGateway].url}/${typeof route === 'function' ? route(...args) : route}`;
      const invokePayload = generateInvokePayload(res.locals, 'APIGateway', {
        ...options,
        additionalHeaders,
        httpMethod: method,
      });

      const response = await APIClient.request(url, invokePayload);
      return response;
    } catch (error) {
      console.log('error in gateway invoker: ', error);
      errorlib({
        message: error.message,
        errorCode: error.statusCode,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
    return;
  };

  next();
}

export { InvokeLambda };
