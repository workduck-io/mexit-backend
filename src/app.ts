import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import 'reflect-metadata';

import { jsonErrorHandler } from './middlewares/jsonerrorhandler';
import { errorCodes } from './libs/errorCodes';
import { LogRequest } from './middlewares/logrequest';
import logger from './libs/logger';
import expressListRoutes, { COLORS, colorText } from './libs/routeList';
import { IS_DEV } from './env';

import OAuth2Controller from './controllers/OAuth2Controller';
import BookmarkController from './controllers/BookmarkController';
import NodeController from './controllers/NodeController';
import PublicController from './controllers/PublicController';
import SharedController from './controllers/SharedController';
import ShortenerController from './controllers/ShortenerController';
import SnippetController from './controllers/SnippetController';
import TagController from './controllers/TagController';
import UserController from './controllers/UserController';
import responseErrorHandler from './middlewares/responseErrorHandler';

class App {
  public _app: express.Application;
  public _port: number;
  private readonly _controllers: unknown;

  constructor(controllers) {
    this._port = parseInt(process.env.PORT) || 5000;
    this._controllers = controllers;
  }

  public build() {
    this._app = express();
    this.initializeMiddlewares();
    this.initializeControllers(this._controllers);
    this.initializeErrorHandlers();
  }

  private initializeMiddlewares() {
    this._app.use(cors());
    this._app.use(express.json());
    this._app.use(LogRequest);
  }

  private initializeErrorHandlers() {
    this._app.use(jsonErrorHandler);
  }

  private initializeControllers(controllers) {
    controllers.forEach(controller => {
      this._app.use('/api/v1/', controller._router);
    });
    this._app.use((req, res, next) => {
      res.status(404);
      logger.error('Route not found');
      res.json({
        statusCode: 404,
        message: 'Route not found',
        errorCode: errorCodes.NOT_FOUND,
      });
      next();
    });
    this._app.use(responseErrorHandler);
  }
}

const application = new App([
  new BookmarkController(),
  new NodeController(),
  new OAuth2Controller(),
  new PublicController(),
  new SharedController(),
  new ShortenerController(),
  new SnippetController(),
  new TagController(),
  new UserController(),
]);

application.build();
application._app.listen(application._port, () => {
  if (IS_DEV) {
    console.log(
      colorText(
        COLORS.red,
        `Express is listening at http://localhost:${application._port}`
      )
    );
    expressListRoutes(application._app);
  }
  return;
});
