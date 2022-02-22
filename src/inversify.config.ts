import 'reflect-metadata';
import { Container } from 'inversify';
import { NodeManager } from './managers/NodeManager';
import { ShortenerManager } from './managers/ShortenerManager';
import { GotClient } from './libs/GotClientClass';
import { Transformer } from './libs/TransformerClass';
import { Cache } from './libs/CacheClass';
import { Lambda } from './libs/LambdaClass';
import { UserManager } from './managers/UserManager';

const container = new Container();

container.bind<GotClient>(GotClient).to(GotClient).inSingletonScope();
container.bind<Transformer>(Transformer).to(Transformer).inSingletonScope();
container.bind<NodeManager>(NodeManager).to(NodeManager).inSingletonScope();
container
  .bind<ShortenerManager>(ShortenerManager)
  .to(ShortenerManager)
  .inSingletonScope();
container.bind<UserManager>(UserManager).to(UserManager).inSingletonScope();
container.bind<Cache>(Cache).to(Cache).inSingletonScope();
container.bind<Lambda>(Lambda).to(Lambda).inSingletonScope();
export default container;
