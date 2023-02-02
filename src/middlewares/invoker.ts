import { NextFunction, Request, Response } from 'express';
import { errorlib } from '../libs/errorlib';
import {
  InvocationType,
  invokeAndCheck,
  LambdaOptions,
} from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { statusCodes } from '../libs/statusCodes';
import { generateLambdaInvokePayload } from '../utils/lambda';

async function InvokeLambda(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.locals.invoker = async (
    functionName: string,
    invocationType: InvocationType,
    routeKey: keyof typeof RouteKeys,
    options: LambdaOptions
  ) => {
    try {
      const invokePayload = generateLambdaInvokePayload(
        res.locals,
        routeKey,
        options
      );
      return await invokeAndCheck(functionName, invocationType, invokePayload);
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
