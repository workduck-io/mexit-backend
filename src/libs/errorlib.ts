import { errorCodes } from './errorCodes';
import { statusCodes } from './statusCodes';
import WDError from './WDError';

interface IErrorParams {
  message: string;
  errorObject?: any;
  errorCode?: errorCodes;
  statusCode?: statusCodes;
  metaData?: string;
}

export function errorlib(params: IErrorParams) {
  const { message, errorObject, errorCode, statusCode, metaData } = params;

  const errorcode = errorCode ?? errorCodes.UNKNOWN;
  const statuscode = statusCode ?? statusCodes.INTERNAL_SERVER_ERROR;
  const metadata = metaData ?? '';

  if (errorObject && errorObject.response) {
    throw new WDError({
      message: errorObject.response.message,
      code: errorObject.response.code,
      statusCode: errorObject.response.statusCode,
      metadata: errorObject.response.metadata,
      stackTrace: errorObject.stack,
    });
  }
  const stack = errorObject ? errorObject.stack : '';

  throw new WDError({
    message,
    code: errorcode,
    statusCode: statuscode,
    metadata,
    stackTrace: stack,
  });
}
