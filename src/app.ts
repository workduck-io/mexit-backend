import compression from 'compression';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import 'reflect-metadata';

import { IS_DEV } from './env';
import { errorCodes } from './libs/errorCodes';
import logger from './libs/logger';
import expressListRoutes, { COLORS, colorText } from './libs/routeList';
import { jsonErrorHandler } from './middlewares/jsonerrorhandler';
import { LogRequest } from './middlewares/logrequest';

import { wdRequestIdExpressParser } from '@workduck-io/wd-request-id-parser';
import ActionController from './controllers/ActionController';
import BookmarkController from './controllers/BookmarkController';
import CommentController from './controllers/CommentController';
import HealthCheckController from './controllers/HealthCheckController';
import HighlightController from './controllers/HighlightController';
import LinkController from './controllers/LinkController';
import LochController from './controllers/LochController';
import NamespaceController from './controllers/NamespaceController';
import NodeController from './controllers/NodeController';
import OAuth2Controller from './controllers/OAuth2Controller';
import PublicController from './controllers/PublicController';
import ReactionController from './controllers/ReactionController';
import ReminderController from './controllers/ReminderController';
import SharedController from './controllers/SharedController';
import SmartCaptureController from './controllers/SmartCaptureController';
import SnippetController from './controllers/SnippetController';
import UserController from './controllers/UserController';
import ViewController from './controllers/ViewController';
import container from './inversify.config';
import { Redis } from './libs/RedisClass';
import responseErrorHandler from './middlewares/responseErrorHandler';
import { parseReviver } from './utils/ArrayX';
import PromptController from './controllers/PromptController';
import { InvokeLambda } from './middlewares/invoker';

class App {
  public _app: express.Application;
  public _port: number;
  private readonly _controllers: unknown;

  constructor(controllers) {
    this._port = parseInt(process.env.PORT) || 5002;
    this._controllers = controllers;
  }

  public build() {
    this._app = express();
    this.initializeMiddlewares();
    this.initializeControllers(this._controllers);
    this.initializeErrorHandlers();
  }

  private initializeMiddlewares() {
    this._app.use(compression());
    this._app.use(cors());
    this._app.use(express.json({ reviver: parseReviver }));
    this._app.use(LogRequest);
    this._app.use(wdRequestIdExpressParser);
    this._app.use(InvokeLambda);
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
const redisCache: Redis = container.get<Redis>(Redis);
const application = new App([
  new HealthCheckController(),
  new LinkController(),
  new NodeController(),
  new OAuth2Controller(),
  new PublicController(),
  new SharedController(),
  new SnippetController(),
  new UserController(),
  new NamespaceController(),
  new ReminderController(),
  new ViewController(),
  new ReactionController(),
  new CommentController(),
  new BookmarkController(),
  new SmartCaptureController(),
  new HighlightController(),
  new LochController(),
  new ActionController(),
  new PromptController(),
]);

application.build();
application._app.listen(application._port, async () => {
  await redisCache.client.connect();
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

process.on('SIGINT', async () => {
  await redisCache.client.disconnect();
  throw new Error();
});
