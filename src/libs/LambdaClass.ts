import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node';

import { WDError } from '@workduck-io/wderror';
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
  httpMethod?: string;
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
      toUtf8(
        (
          await LambdaConfig.invokeLambdaClient({
            FunctionName: functionName,
            Payload: fromUtf8(
              JSON.stringify(
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
                      ...(options.httpMethod && {
                        httpMethod: options.httpMethod,
                      }),
                    }
              )
            ),
            InvocationType: invocationType,
          })
        ).Payload
      )
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
