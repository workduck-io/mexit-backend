import { NextFunction, Request, Response } from 'express';

import { type InvocationSource } from '../interfaces/Locals';
import { errorlib } from '../libs/errorlib';
import { invokeAndCheck } from '../libs/LambdaInvoker';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';
import { generateLambdaInvokePayload, LambdaInvokePayloadOptions } from '../utils/lambda';

async function InvokeLambda(req: Request, res: Response, next: NextFunction): Promise<void> {
  res.locals.invoker = async <T = any>(
    functionName: string,
    routeKey: keyof typeof RouteKeys,
    options?: LambdaInvokePayloadOptions<T>,
    sendRawBody = false,
    invocationSource: InvocationSource = 'APIGateway'
  ) => {
    try {
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
    } catch (error: any) {
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
