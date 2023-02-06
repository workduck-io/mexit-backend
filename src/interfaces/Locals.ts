import { InvocationType } from '../libs/LambdaClass';
import { RouteKeys } from '../libs/routeKeys';
import { LambdaInvokePayloadOptions } from '../utils/lambda';

export interface LocalsX {
  workspaceID?: string;
  idToken?: string;
  userId?: string;
  userEmail?: string;
  userIdRaw?: string;
  invoker?: <T = any>(
    functionName: string,
    invocationType: InvocationType,
    routeKey?: keyof typeof RouteKeys,
    options?: LambdaInvokePayloadOptions<T>
  ) => Promise<any>;
}
