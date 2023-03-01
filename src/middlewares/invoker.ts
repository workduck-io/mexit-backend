import { NextFunction, Request, Response } from 'express';

import { type InvocationSource } from '../interfaces/Locals';
import { errorlib } from '../libs/errorlib';
import { invokeAndCheck } from '../libs/LambdaInvoker';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';
import {
  generateAPIGatewayInvokePayload,
  generateLambdaInvokePayload,
  LambdaInvokePayloadOptions,
} from '../utils/generatePayload';

import got from 'got';
import mem from 'mem';
import StatsMap from 'stats-map';

export type InvocationDestination = 'Lambda' | 'REST' | 'HTTP';

const cache = new StatsMap();
const gotClient = mem(got, { cache: cache });

async function InvokeLambda(req: Request, res: Response, next: NextFunction): Promise<void> {
  res.locals.invoker = async <T = any>(
    functionName: string,
    routeKey: keyof typeof RouteKeys,
    options?: LambdaInvokePayloadOptions<T>,
    sendRawBody = false,
    invocationSource: InvocationSource = 'APIGateway',
    invocationDestination: InvocationDestination = 'Lambda'
  ) => {
    try {
      if (invocationDestination === 'Lambda') {
        if (options?.allSettled) {
          const promises = options.allSettled.ids.map(id => {
            const invokePayload = generateLambdaInvokePayload(res.locals, routeKey, {
              ...options,
              pathParameters: {
                ...(options?.pathParameters ?? {}),
                [options?.allSettled?.key]: id,
              },
            });
            return invokeAndCheck(functionName, 'RequestResponse', invokePayload, sendRawBody, invocationSource);
          });

          return await Promise.allSettled(promises);
        } else {
          const invokePayload = generateLambdaInvokePayload(res.locals, routeKey, options);
          return await invokeAndCheck(functionName, 'RequestResponse', invokePayload, sendRawBody, invocationSource);
        }
      } else {
        const url =
          invocationDestination === 'HTTP'
            ? 'https://cn5gt90qx5.execute-api.us-east-1.amazonaws.com/v1/node'
            : 'https://77956pfj9b.execute-api.us-east-1.amazonaws.com/test/v1/node/rest';

        console.log('Invoking: ', { url, invocationDestination });
        const invokePayload = generateAPIGatewayInvokePayload(res.locals, routeKey, options);
        const resp = await got(url, { ...invokePayload, throwHttpErrors: false }).json();
        return resp;
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

  next();
}

export { InvokeLambda };
