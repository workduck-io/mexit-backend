import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';

const responseErrorHandler: ErrorRequestHandler = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction // eslint-disable-line
) => {
  response.status(error.response.statusCode).json({
    message: error.response.message,
    statusCode: error.response.statusCode,
  });
};

export default responseErrorHandler;
