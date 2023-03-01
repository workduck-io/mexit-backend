import { RouteKeys } from '../libs/routeKeys';
import { InvocationDestination } from '../middlewares/invoker';
import { LambdaInvokePayloadOptions } from '../utils/generatePayload';

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
    invocationSource?: InvocationSource,
    invocationDestination?: InvocationDestination
  ) => Promise<any>;
}
