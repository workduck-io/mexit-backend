interface IWDErrorResponse {
  message: string;
  code: string;
  statusCode: number;
  metadata?: string;
  stackTrace?: string;
}

export default class WDError extends Error {
  response: IWDErrorResponse;

  constructor(response: IWDErrorResponse) {
    super(response.message);
    this.response = response;
  }
}
