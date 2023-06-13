import { NextFunction, Request, Response } from 'express';

// @ts-ignore
// eslint-disable-next-line
import Config from '../config.json';
import { IS_DEV } from '../env';
import container from '../inversify.config';
import { errorlib } from '../libs/errorlib';
import { GotClient } from '../libs/GotClientClass';
import { invokeAndCheck } from '../libs/LambdaInvoker';
import { Destination, RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';
import { generateInvokePayload, getPathFromPathParameters, InvokePayloadOptions } from '../utils/generatePayload';
import { LocalsX } from '../utils/Locals';

const APIClient = container.get<GotClient>(GotClient);
const forceAPIGatewayInvoker = !!process.env.FORCE_API_GATEWAY;

const lambdaInvoker = async <T = any>(
  routeKey: keyof typeof RouteKeys,
  locals: LocalsX,
  options?: InvokePayloadOptions<T>
) => {
  try {
    const { route, functionName } = RouteKeys[routeKey] as Destination;
    if (options?.allSettled) {
      const promises = options.allSettled.ids.map(id => {
        const invokePayload = generateInvokePayload(
          locals,
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
      const invokePayload = generateInvokePayload(locals, 'Lambda', options, route);
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
  locals: LocalsX,
  options?: InvokePayloadOptions<T>
): Promise<any> => {
  try {
    const { route, APIGateway } = RouteKeys[routeKey] as Destination;

    const additionalHeaders = { 'x-api-key': Config[APIGateway].token };
    const invokePayload = generateInvokePayload(
      locals,
      'APIGateway',
      {
        ...options,
        additionalHeaders,
      },
      route
    );

    const path = options?.pathParameters ? getPathFromPathParameters(route, options.pathParameters) : route;
    const url = `${Config[APIGateway].url}${path.split(' ')[1]}`;

    console.log('URL IS ', { url });

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

async function InvokeLambda(req: Request, res: Response, next: NextFunction): Promise<void> {
  res.locals.invoker = async <T = any>(
    routeKey: keyof typeof RouteKeys,
    options?: InvokePayloadOptions<T>,
    invokerDestination: 'APIGateway' | 'Lambda' = 'Lambda'
  ): Promise<any> => {
    const useLambdaInvoker = IS_DEV && !forceAPIGatewayInvoker;
    console.log('LOGG THIS');

    console.log("I'll decide ", {
      check: invokerDestination === 'Lambda' || useLambdaInvoker,
      useLambdaInvoker,
      invokerDestination,
      forceAPIGatewayInvoker,
      IS_DEV,
    });

    if (invokerDestination === 'Lambda' || useLambdaInvoker) {
      return await lambdaInvoker(routeKey, res.locals, options);
    } else {
      return await gatewayInvoker(routeKey, res.locals, options);
    }
  };

  next();
}

export { InvokeLambda };
