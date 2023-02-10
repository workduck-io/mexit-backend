import { RouteKeys } from '../libs/routeKeys';
import { LambdaInvokePayloadOptions } from '../utils/lambda';

export type InvocationSource = 'Direct' | 'APIGateway';
export interface LocalsX {
  workspaceID?: string;
  idToken?: string;
  userId?: string;
  userEmail?: string;
  userIdRaw?: string;
  invoker?: <T = any>(
    functionName: string,
    routeKey?: keyof typeof RouteKeys,
    options?: LambdaInvokePayloadOptions<T>,
    sendRawBody?: boolean,
    invocationSource?: InvocationSource
  ) => Promise<any>;
}
