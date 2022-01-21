import 'reflect-metadata';
import { Container } from 'inversify';
import { NodeManager } from './managers/NodeManager';
import { AuthManager } from './managers/AuthManager';

const container = new Container();

container.bind<NodeManager>(NodeManager).to(NodeManager).inSingletonScope();
container.bind<AuthManager>(AuthManager).to(AuthManager).inSingletonScope();

export default container;
