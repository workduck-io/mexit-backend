import { IWDErrorResponse } from 'src/libs/WDError';

export const jsonErrorHandler = async (err, req, res, next) => {
  const { response } = err;
  const error: IWDErrorResponse = response;
  res.setHeader('Content-Type', 'application/json');
  res.status(error.statusCode).send(error);
};
