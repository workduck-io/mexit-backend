import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';

export interface WDErrorType {
  message: string;
  errorObject?: any;
  errorCode?: errorCodes;
  statusCode?: statusCodes;
  metaData?: string;
}
