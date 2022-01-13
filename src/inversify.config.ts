import 'reflect-metadata';
import { Container } from 'inversify';
import { NodeManager } from './managers/NodeManager';

const container = new Container();

container.bind<NodeManager>(NodeManager).to(NodeManager).inSingletonScope();

export default container;
