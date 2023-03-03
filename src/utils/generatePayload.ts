import { type LocalsX } from '../interfaces/Locals';
import { type LambdaInvokeOptions } from '../libs/LambdaInvoker';
import { RouteKeys } from '../libs/routeKeys';

export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface InvokePayloadOptions<T> {
  payload?: T;
  additionalHeaders?: Record<string, string>;
  queryStringParameters?: Record<string, any>;
  pathParameters?: Record<string, any>;
  // Can only iterate over path params for now
  allSettled?: {
    ids: string[];
    key: string;
  };
  httpMethod?: HTTPMethod;
}

interface GatewayInvokeOptions {
  method: HTTPMethod;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
  json?: any;
}

export type InvokeOptions = LambdaInvokeOptions | GatewayInvokeOptions;
// export const generateLambdaInvokePayload = <T = any>(
//   locals: LocalsX,
//   routeKey: keyof typeof RouteKeys,
//   options?: InvokePayloadOptions<T>
// ): LambdaOptions => {
//   let headers = {
//     'mex-workspace-id': locals?.workspaceID ?? '',
//     authorization: locals?.idToken,
//   };

//   if (options?.additionalHeaders) {
//     headers = { ...headers, ...options.additionalHeaders };
//   }

//   const rKeyVal = RouteKeys[routeKey];

//   return {
//     httpMethod: options?.httpMethod ?? rKeyVal.split(' ')[0],
//     ...(rKeyVal && { routeKey: rKeyVal }),
//     headers: headers,
//     ...(options?.payload && { payload: options.payload }),
//     ...(options?.queryStringParameters && {
//       queryStringParameters: options.queryStringParameters,
//     }),
//     ...(options?.pathParameters && { pathParameters: options.pathParameters }),
//   };
// };

// export const generateAPIGatewayInvokePayload = <T = any>(
//   locals: LocalsX,
//   routeKey: keyof typeof RouteKeys,
//   options?: InvokePayloadOptions<T>
// ): any => {
//   let headers = {
//     'mex-workspace-id': locals?.workspaceID ?? '',
//     authorization: locals?.idToken,
//     'x-api-key': process.env.REST_API_KEY,
//   };

//   if (options?.additionalHeaders) {
//     headers = { ...headers, ...options.additionalHeaders };
//   }

//   return {
//     method: 'POST',
//     ...(options?.payload && { json: options.payload }),
//     headers: headers,
//   };
// };

export const generateInvokePayload = <T = any>(
  locals: LocalsX,
  invokerDestination: 'APIGateway' | 'Lambda' = 'Lambda',
  options?: InvokePayloadOptions<T>,
  routeKey?: keyof typeof RouteKeys
): Partial<InvokeOptions> => {
  const isAPIGateway = invokerDestination === 'APIGateway';
  console.log('IS API Gateway', { isAPIGateway, key: process.env.REST_API_KEY });
  let headers = {
    'mex-workspace-id': locals?.workspaceID ?? '',
    authorization: locals?.idToken,
    ...(isAPIGateway && { 'x-api-key': process.env.REST_API_KEY }),
  };

  if (options?.additionalHeaders) {
    headers = { ...headers, ...options.additionalHeaders };
  }

  let payload: Partial<InvokeOptions> = {
    headers: headers,
    ...(options?.payload && (isAPIGateway ? { json: options.payload } : { payload: options.payload })),
  };

  if (isAPIGateway) {
    payload['method'] = options?.httpMethod;
  } else {
    const rKeyVal = RouteKeys[routeKey];
    payload = {
      ...payload,
      httpMethod: options?.httpMethod ?? rKeyVal.split(' ')[0],
      ...(options?.queryStringParameters && {
        queryStringParameters: options.queryStringParameters,
      }),
      ...(options?.pathParameters && { pathParameters: options.pathParameters }),
    };
  }

  return payload;
};
