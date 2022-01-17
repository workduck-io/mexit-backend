import 'reflect-metadata';
import { Container } from 'inversify';
import { NodeManager } from './managers/NodeManager';
import { WorkspaceManager } from './managers/WorkspaceManager';
import { AuthManager } from './managers/AuthManager';
import { DbService } from './services/DbService';
import { HighlightNodeManager } from './managers/HighlightNodeManager';

const container = new Container();

container.bind<DbService>(DbService).to(DbService).inSingletonScope();

container.bind<NodeManager>(NodeManager).to(NodeManager).inSingletonScope();
container
  .bind<WorkspaceManager>(WorkspaceManager)
  .to(WorkspaceManager)
  .inSingletonScope();
container.bind<AuthManager>(AuthManager).to(AuthManager).inSingletonScope();
container
  .bind<HighlightNodeManager>(HighlightNodeManager)
  .to(HighlightNodeManager)
  .inSingletonScope();
export default container;
