import { LocalsX } from '../interfaces/Locals';
import { LambdaInvokeOptions } from '../libs/LambdaInvoker';

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
  sendRawBody?: boolean;
}

interface GatewayInvokeOptions {
  method: HTTPMethod;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
  json?: any;
}

export type InvokeOptions = LambdaInvokeOptions | GatewayInvokeOptions;

export const generateInvokePayload = <T = any>(
  locals: LocalsX,
  invokerDestination: 'APIGateway' | 'Lambda' = 'Lambda',
  options?: InvokePayloadOptions<T>,
  route?: string
): Partial<InvokeOptions> => {
  const isAPIGateway = invokerDestination === 'APIGateway';
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
    payload = {
      ...payload,
      ...(route && { routeKey: route }),
      httpMethod: options?.httpMethod ?? route.split(' ')[0],
      ...(options?.queryStringParameters && {
        queryStringParameters: options.queryStringParameters,
      }),
      ...(options?.pathParameters && { pathParameters: options.pathParameters }),
    };
  }

  return payload;
};
