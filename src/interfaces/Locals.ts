import { APIGatewayRouteKeys, RouteKeys } from '../libs/routeKeys';
import { InvokePayloadOptions } from '../utils/generatePayload';

export type InvocationSource = 'Direct' | 'APIGateway';
export interface LocalsX {
  workspaceID?: string;
  idToken?: string;
  userId?: string;
  userEmail?: string;
  userIdRaw?: string;
  lambdaInvoker?: <T = any>(
    functionName: string,
    routeKey?: keyof typeof RouteKeys,
    options?: InvokePayloadOptions<T> & { sendRawBody?: boolean; invocationSource?: InvocationSource }
  ) => Promise<any>;
  gatewayInvoker?: <T = any>(
    routeKey: keyof typeof APIGatewayRouteKeys,
    options?: InvokePayloadOptions<T>,
    ...args: string[]
  ) => Promise<any>;
  invoker?: any;
}
