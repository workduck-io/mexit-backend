import { GenericType } from '../interfaces/Generics';

export interface IWDErrorResponse {
  message: GenericType;
  code: GenericType;
  statusCode: number;
  metadata?: GenericType;
  stackTrace?: GenericType;
}

export default class WDError extends Error {
  response: IWDErrorResponse;

  constructor(response: IWDErrorResponse) {
    super(response?.message?.toString());
    this.response = response;
  }
}
