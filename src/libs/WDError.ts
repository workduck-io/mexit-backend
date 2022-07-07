import { GenericType } from '../interfaces/Generics';

export interface IWDErrorResponse {
  message: GenericType;
  code: GenericType;
  statusCode: number;
  metadata?: GenericType;
  stackTrace?: GenericType;
}
