import 'reflect-metadata';
import { Container } from 'inversify';
import { NodeManager } from './managers/NodeManager';
import { WorkspaceManager } from './managers/WorkspaceManager';

const container = new Container();

container.bind<NodeManager>(NodeManager).to(NodeManager).inSingletonScope();
container
  .bind<WorkspaceManager>(WorkspaceManager)
  .to(WorkspaceManager)
  .inSingletonScope();

export default container;
