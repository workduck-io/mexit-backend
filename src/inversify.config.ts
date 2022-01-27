import 'reflect-metadata';
import { Container } from 'inversify';
import { NodeManager } from './managers/NodeManager';
import { AuthManager } from './managers/AuthManager';
import { GotClient } from './libs/GotClientClass';
import { Transformer } from './libs/TransformerClass';

const container = new Container();

container.bind<GotClient>(GotClient).to(GotClient).inSingletonScope();
container.bind<Transformer>(Transformer).to(Transformer).inSingletonScope();
container.bind<NodeManager>(NodeManager).to(NodeManager).inSingletonScope();
container.bind<AuthManager>(AuthManager).to(AuthManager).inSingletonScope();

export default container;
