import { NextFunction, Request, Response } from 'express';

// @ts-ignore
// eslint-disable-next-line
import Config from '../config.json';
import { IS_DEV } from '../env';
import { APIGatewayDestination, LambdaDestination } from '../interfaces/Request';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { GotClient } from '../libs/GotClientClass';
import { invokeAndCheck } from '../libs/LambdaInvoker';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';
import { generateInvokePayload, InvokePayloadOptions } from '../utils/generatePayload';

const APIClient = container.get<GotClient>(GotClient);
const forceAPIGatewayInvoker = !!process.env.FORCE_API_GATEWAY;

async function InvokeLambda(req: Request, res: Response, next: NextFunction): Promise<void> {
  const lambdaInvoker = async <T = any>(routeKey: keyof typeof RouteKeys, options?: InvokePayloadOptions<T>) => {
    try {
      const { route, functionName } = RouteKeys[routeKey] as LambdaDestination;
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
            route
          );
          return invokeAndCheck(functionName, 'RequestResponse', invokePayload, options?.sendRawBody ?? false);
        });

        return await Promise.allSettled(promises);
      } else {
        const invokePayload = generateInvokePayload(res.locals, 'Lambda', options, route);
        console.log('Invoke Payload: ', { invokePayload, functionName });
        return await invokeAndCheck(functionName, 'RequestResponse', invokePayload, options?.sendRawBody ?? false);
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

  const gatewayInvoker = async <T = any>(
    routeKey: keyof typeof RouteKeys,
    options?: InvokePayloadOptions<T>,
    ...args: string[]
  ): Promise<any> => {
    try {
      const { route, APIGateway } = RouteKeys[routeKey] as APIGatewayDestination;

      const additionalHeaders = { 'x-api-key': Config[APIGateway].token };
      const path = (typeof route === 'function' ? route(...args) : route).split(' ')[1];
      const url = `${Config[APIGateway].url}/${path}`;
      const invokePayload = generateInvokePayload(res.locals, 'APIGateway', {
        ...options,
        additionalHeaders,
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

  res.locals.invoker = async <T = any>(
    routeKey: keyof typeof RouteKeys,
    options?: InvokePayloadOptions<T>,
    invokerDestination: 'APIGateway' | 'Lambda' = 'APIGateway',
    ...args: string[]
  ): Promise<any> => {
    const useLambdaInvoker = IS_DEV && !forceAPIGatewayInvoker;
    if (invokerDestination === 'Lambda' || useLambdaInvoker) {
      return await lambdaInvoker(routeKey, options);
    } else {
      console.log('Using API Gateway Invoker', { routeKey });
      return await gatewayInvoker(routeKey, options, ...args);
    }
  };
  next();
}

export { InvokeLambda };
