import { injectable } from 'inversify';
import LambdaConfig from './InvokeLambda';
import WDError from './WDError';
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

  async invokeAndCheck(
    functionName: string,
    invocationType: InvocationType,
    options: LambdaOptions,
    sendRawBody = false,
    invocationSource: InvocationSource = 'APIGateway'
  ) {
    const response = await this.invoke(
      functionName,
      invocationType,
      options,
      sendRawBody,
      invocationSource
    );

    const body = response.body ? JSON.parse(response.body) : undefined;
    if (response.statusCode !== 200 && response.statusCode !== 204) {
      throw new WDError({
        statusCode: response.statusCode,
        message: body ? body.message : '',
        code: response.statusCode,
      });
    }
    return body;
  }
}
