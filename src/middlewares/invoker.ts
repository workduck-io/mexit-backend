import { NextFunction, Request, Response } from 'express';

// @ts-ignore
// eslint-disable-next-line
import Config from '../config.json';
import { InvocationSource } from '../interfaces/Locals';
import { APIGatewayDestination, LambdaDestination } from '../interfaces/Request';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { GotClient } from '../libs/GotClientClass';
import { invokeAndCheck } from '../libs/LambdaInvoker';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';
import { generateInvokePayload, InvokePayloadOptions } from '../utils/generatePayload';

const APIClient = container.get<GotClient>(GotClient);
const isProduction = process.env.NODE_ENV === 'production';
const forceAPIGatewayInvoker = !!process.env.FORCE_API_GATEWAY;

async function InvokeLambda(req: Request, res: Response, next: NextFunction): Promise<void> {
  res.locals.lambdaInvoker = async <T = any>(
    routeKey: keyof typeof RouteKeys,
    options?: InvokePayloadOptions<T> & { sendRawBody: boolean; invocationSource: InvocationSource }
  ) => {
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
          return invokeAndCheck(
            functionName,
            'RequestResponse',
            invokePayload,
            options?.sendRawBody ?? false,
            options?.invocationSource ?? 'APIGateway'
          );
        });

        return await Promise.allSettled(promises);
      } else {
        const invokePayload = generateInvokePayload(res.locals, 'Lambda', options, route);
        return await invokeAndCheck(
          functionName,
          'RequestResponse',
          invokePayload,
          options?.sendRawBody ?? false,
          options?.invocationSource ?? 'APIGateway'
        );
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
    routeKey: keyof typeof RouteKeys,
    options?: InvokePayloadOptions<T>,
    ...args: string[]
  ): Promise<any> => {
    try {
      const { method, route, APIGateway } = RouteKeys[routeKey] as APIGatewayDestination;

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

  res.locals.invoker = async (routeKey: keyof typeof RouteKeys) => {
    if (forceAPIGatewayInvoker || isProduction) {
      return await res.locals.gatewayInvoker(routeKey);
    } else {
      return await res.locals.lambdaInvoker;
    }
  };
  next();
}

export { InvokeLambda };
