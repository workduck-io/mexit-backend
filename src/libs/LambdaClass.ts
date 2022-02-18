import { injectable } from 'inversify';
import LambdaConfig from './InvokeLambda';
export type InvocationType = 'RequestResponse' | 'Event';

interface LambdaOptions {
  payload?: any;
  pathParameters?: any;
  routeKey: string;
}

@injectable()
export class Lambda {
  async invoke(
    functionName: string,
    invocationType: InvocationType,
    options: LambdaOptions,
    sendRawBody = false
  ) {
    return JSON.parse(
      (
        await LambdaConfig.invokeLambdaClient({
          FunctionName: functionName,
          Payload: JSON.stringify({
            ...(options.pathParameters && {
              pathParameters: options.pathParameters,
            }),
            ...(options.payload && {
              body: sendRawBody
                ? options.payload
                : JSON.stringify(options.payload),
            }),
            routeKey: options.routeKey,
          }),
          InvocationType: invocationType,
        })
      ).Payload as string
    );
  }
}
