import { injectable } from 'inversify';
import LambdaConfig from './InvokeLambda';
export type InvocationType = 'RequestResponse' | 'Event';

interface LambdaOptions {
  payload?: any;
  pathParameters?: any;
  routeKey: string;
  queryStringParameters?: any;
  headers?: any;
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
            ...(options.queryStringParameters && {
              queryStringParameters: options.queryStringParameters,
            }),
            ...(options.headers && {
              headers: options.headers,
            }),
          }),
          InvocationType: invocationType,
        })
      ).Payload as string
    );
  }
}

@injectable()
export class DirectLambdaInvocation {
  async invoke(
    functionName: string,
    invocationType: InvocationType,
    body: any
  ) {
    return JSON.parse(
      (
        await LambdaConfig.invokeLambdaClient({
          FunctionName: functionName,
          Payload: JSON.stringify(body),
          InvocationType: invocationType,
        })
      ).Payload as string
    );
  }
}
