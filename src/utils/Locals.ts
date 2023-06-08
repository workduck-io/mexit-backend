import { BroadcastMessage } from '../interfaces/Broadcast';
import { RouteKeys } from '../libs/routeKeys';

import { InvokePayloadOptions } from './generatePayload';

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
  broadcaster?: (message: BroadcastMessage) => Promise<void>
}
