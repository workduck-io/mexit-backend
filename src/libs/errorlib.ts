import { WDError } from '@workduck-io/wderror';
import { WDErrorType } from 'src/interfaces/WDError';
import { errorCodes } from './errorCodes';
import { statusCodes } from './statusCodes';

export function errorlib(params: WDErrorType) {
  const { message, errorObject, errorCode, statusCode, metaData } = params;

  const errorcode = errorCode ?? errorCodes.UNKNOWN;
  const statuscode = statusCode ?? statusCodes.INTERNAL_SERVER_ERROR;
  const metadata = metaData ?? '';

  if (errorObject && errorObject.response) {
    throw new WDError({
      message: errorObject.response?.message,
      code: errorObject.response?.code,
      statusCode: errorObject.response?.statusCode,
      metadata: errorObject.response?.metadata,
      stackTrace: errorObject?.stack,
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

export const UnexpectedError = (error: any) => {
  errorlib({
    message: error.message,
    errorCode: error.statusCode,
    errorObject: error,
    statusCode: statusCodes.INTERNAL_SERVER_ERROR,
    metaData: error.message,
  });
};
