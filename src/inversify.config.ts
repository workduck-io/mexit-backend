import 'reflect-metadata';
import { Container } from 'inversify';
import { NodeManager } from './managers/NodeManager';
import { AuthManager } from './managers/AuthManager';
import { GotClient } from './libs/GotClientClass';
import { Transformer } from './libs/TransformerClass';
import { Cache } from './libs/CacheClass';

const container = new Container();

container.bind<GotClient>(GotClient).to(GotClient).inSingletonScope();
container.bind<Transformer>(Transformer).to(Transformer).inSingletonScope();
container.bind<NodeManager>(NodeManager).to(NodeManager).inSingletonScope();
container.bind<AuthManager>(AuthManager).to(AuthManager).inSingletonScope();
container.bind<Cache>(Cache).to(Cache).inSingletonScope();
export default container;
