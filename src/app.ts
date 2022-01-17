import express from 'express';
import { jsonErrorHandler } from './middlewares/jsonerrorhandler';
import cors from 'cors';
import NodeController from './controllers/NodeController';
import WorkspaceController from './controllers/WorkspaceController';
import AuthController from './controllers/AuthController';
import container from './inversify.config';
import { DbService } from './services/DbService';
import HighlightNodeController from './controllers/HighlightNodeController';

class App {
  public _app: express.Application;
  public _port: number;
  private readonly _controllers: unknown;

  constructor(controllers) {
    this._port = parseInt(process.env.PORT) || 3000;
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
  }

  private initializeErrorHandlers() {
    this._app.use(jsonErrorHandler);
  }

  private initializeControllers(controllers) {
    controllers.forEach(controller => {
      this._app.use('/api/v1/', controller._router);
    });
  }
}

const application = new App([
  new AuthController(),
  new NodeController(),
  new WorkspaceController(),
  new HighlightNodeController(),
]);
application.build();

container.get<DbService>(DbService).connect();
application._app.listen(application._port, () => {
  return console.log(
    `Express is listening at http://localhost:${application._port}`
  );
});
