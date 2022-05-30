import express from 'express';
import { jsonErrorHandler } from './middlewares/jsonerrorhandler';
import cors from 'cors';
import NodeController from './controllers/NodeController';
import SearchController from './controllers/SearchController';
import ShortenerController from './controllers/ShortenerController';
import { errorCodes } from './libs/errorCodes';
import 'dotenv/config';
import UserController from './controllers/UserController';
import { LogRequest } from './middlewares/logrequest';
import logger from './libs/logger';
import OAuth2Controller from './controllers/OAuth2Controller';
import SnippetController from './controllers/SnippetController';
import BookmarkController from './controllers/BookmarkController';
import PublicController from './controllers/PublicController';

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
  }
}

const application = new App([
  new OAuth2Controller(),
  new NodeController(),
  new SearchController(),
  new ShortenerController(),
  new UserController(),
  new SnippetController(),
  new BookmarkController(),
  new PublicController(),
]);
application.build();
application._app.listen(application._port, () => {
  return console.log(
    `Express is listening at http://localhost:${application._port}`
  );
});
