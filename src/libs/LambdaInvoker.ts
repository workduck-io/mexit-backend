import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node';

import { WDError } from '@workduck-io/wderror';
import { JSONX } from '../utils/JSONX';
import LambdaConfig from './InvokeLambda';
import { statusCodes } from './statusCodes';

type InvocationType = 'RequestResponse' | 'Event';
type InvocationSource = 'Direct' | 'APIGateway';

export interface LambdaOptions {
  payload?: any;
  pathParameters?: any;
  routeKey?: string;
  queryStringParameters?: any;
  headers?: any;
  httpMethod?: string;
}

async function invoke(
  functionName: string,
  invocationType: InvocationType,
  options: LambdaOptions,
  sendRawBody = false,
  invocationSource: InvocationSource = 'APIGateway'
) {
  if (!options.headers) options.headers = {};
  return JSONX.parse(
    toUtf8(
      (
        await LambdaConfig.invokeLambdaClient({
          FunctionName: functionName,
          Payload: fromUtf8(
            JSONX.stringify(
              invocationSource === 'Direct'
                ? options.payload
                : {
                    ...(options.pathParameters && {
                      pathParameters: options.pathParameters,
                    }),
                    ...(options.payload && {
                      body: sendRawBody ? options.payload : JSONX.stringify(options.payload),
                    }),
                    routeKey: options.routeKey,
                    ...(options.queryStringParameters && {
                      queryStringParameters: options.queryStringParameters,
                    }),
                    ...{
                      headers: options.headers,
                    },
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

export async function invokeAndCheck(
  functionName: string,
  invocationType: InvocationType,
  options: LambdaOptions,
  sendRawBody = false,
  invocationSource: InvocationSource = 'APIGateway'
) {
  const response = await invoke(functionName, invocationType, options, sendRawBody, invocationSource);
  const body = JSONX.parse(response.body);

  if ((response.statusCode !== 200 && response.statusCode !== 204) || !response.statusCode) {
    throw new WDError({
      statusCode: response.statusCode ?? statusCodes.INTERNAL_SERVER_ERROR,
      message: body ? (body?.message ? body.message : body) : response.errorMessage,
      code: response.statusCode ?? statusCodes.INTERNAL_SERVER_ERROR,
    });
  }
  return body;
}
