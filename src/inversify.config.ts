import 'reflect-metadata';
import { Container } from 'inversify';
import { NodeManager } from './managers/NodeManager';
import { WorkspaceManager } from './managers/WorkspaceManager';
import { AuthManager } from './managers/AuthManager';

const container = new Container();

container.bind<NodeManager>(NodeManager).to(NodeManager).inSingletonScope();
container
  .bind<WorkspaceManager>(WorkspaceManager)
  .to(WorkspaceManager)
  .inSingletonScope();
container.bind<AuthManager>(AuthManager).to(AuthManager).inSingletonScope();

export default container;
