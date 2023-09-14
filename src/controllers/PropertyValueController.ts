import express, { NextFunction, Request, Response } from 'express';

import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { initializePropertyValueRoutes } from '../routes/PropertyValueRoutes';

class PropertyValueController {
  public _urlPath = '/property';
  public _router = express.Router();

  constructor() {
    initializePropertyValueRoutes(this);
  }

  getProperty = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('GetProperty');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllProperties = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await response.locals.invoker('GetAllProperties');

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  createProperty = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const data = new RequestClass(request).data;
      await response.locals.invoker('CreateProperty', {
        payload: data,
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  removeProperty = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await response.locals.invoker('DeleteProperty', {
        pathParameters: { id: request.params.propertyId },
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  addPropertyValue = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await response.locals.invoker('AddPropertyValue', {
        payload: request.body,
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  deletePropertyValue = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await response.locals.invoker('DeletePropertyValue', {
        payload: request.body,
      });

      response.status(statusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

export default PropertyValueController;
