import { RouteKeys } from '../libs/routeKeys';
import { InvokePayloadOptions } from '../utils/generatePayload';

export type InvocationSource = 'Direct' | 'APIGateway';
export interface LocalsX {
  workspaceID?: string;
  idToken?: string;
  userId?: string;
  userEmail?: string;
  userIdRaw?: string;
  lambdaInvoker?: <T = any>(
    routeKey?: keyof typeof RouteKeys,
    options?: InvokePayloadOptions<T> & { sendRawBody?: boolean; invocationSource?: InvocationSource }
  ) => Promise<any>;
  gatewayInvoker?: <T = any>(
    routeKey: keyof typeof RouteKeys,
    options?: InvokePayloadOptions<T>,
    ...args: string[]
  ) => Promise<any>;
  invoker?: <T = any>(
    routeKey: keyof typeof RouteKeys,
    options?: InvokePayloadOptions<T>,
    invokerDestination?: 'APIGateway' | 'Lambda',
    ...args: string[]
  ) => Promise<any>;
}
