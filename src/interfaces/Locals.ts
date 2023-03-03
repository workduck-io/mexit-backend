import { RouteKeys } from '../libs/routeKeys';
import { InvokePayloadOptions } from '../utils/generatePayload';

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
    options?: InvokePayloadOptions<T>,
    sendRawBody?: boolean,
    invocationSource?: InvocationSource
  ) => Promise<any>;
  gatewayInvoker?: <T = any>(destination: string, options?: InvokePayloadOptions<T>) => Promise<any>;
}
