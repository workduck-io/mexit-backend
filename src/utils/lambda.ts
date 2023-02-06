import { type LocalsX } from '../interfaces/Locals';
import { LambdaOptions } from '../libs/LambdaClass';

import { RouteKeys } from '../libs/routeKeys';

export interface LambdaInvokePayloadOptions<T> {
  payload?: T;
  additionalHeaders?: Record<string, string>;
  queryStringParameters?: Record<string, any>;
  pathParameters?: Record<string, any>;
  // Can only iterate over path params for now
  allSettled?: {
    ids: string[];
    key: string;
  };
  httpMethod?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
}
export const generateLambdaInvokePayload = <T = any>(
  locals: LocalsX,
  routeKey: keyof typeof RouteKeys,
  options?: LambdaInvokePayloadOptions<T>
): LambdaOptions => {
  let headers = {
    'mex-workspace-id': locals?.workspaceID,
    authorization: locals?.idToken,
  };

  if (options?.additionalHeaders) {
    headers = { ...headers, ...options.additionalHeaders };
  }

  const rKeyVal = RouteKeys[routeKey];

  return {
    httpMethod: options?.httpMethod ?? rKeyVal.split(' ')[0],
    ...(rKeyVal && { routeKey: rKeyVal }),
    headers: headers,
    ...(options?.payload && { payload: options.payload }),
    ...(options?.queryStringParameters && {
      queryStringParameters: options.queryStringParameters,
    }),
    ...(options?.pathParameters && { pathParameters: options.pathParameters }),
  };
};
