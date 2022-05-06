import { injectable } from 'inversify';
import LambdaConfig from './InvokeLambda';
export type InvocationType = 'RequestResponse' | 'Event';
export type InvocationSource = 'Direct' | 'APIGateway';

interface LambdaOptions {
  payload?: any;
  pathParameters?: any;
  routeKey?: string;
  queryStringParameters?: any;
  headers?: any;
}

@injectable()
export class Lambda {
  async invoke(
    functionName: string,
    invocationType: InvocationType,
    options: LambdaOptions,
    sendRawBody = false,
    invocationSource: InvocationSource = 'APIGateway'
  ) {
    return JSON.parse(
      (
        await LambdaConfig.invokeLambdaClient({
          FunctionName: functionName,
          Payload: JSON.stringify(
            invocationSource === 'Direct'
              ? options.payload
              : {
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
                }
          ),
          InvocationType: invocationType,
        })
      ).Payload as string
    );
  }
}
