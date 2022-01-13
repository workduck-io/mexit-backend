import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';

export interface WDErrorType {
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorObject?: any;
  errorCode?: errorCodes;
  statusCode?: statusCodes;
  metaData?: string;
}
