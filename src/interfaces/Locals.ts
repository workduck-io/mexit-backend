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
    routeKey: keyof typeof RouteKeys,
    options?: InvokePayloadOptions<T>,
    invokerDestination?: 'APIGateway' | 'Lambda'
  ) => Promise<any>;
}
