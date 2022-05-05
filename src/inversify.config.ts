import 'reflect-metadata';
import { Container } from 'inversify';
import { NodeManager } from './managers/NodeManager';
import { ShortenerManager } from './managers/ShortenerManager';
import { GotClient } from './libs/GotClientClass';
import { Transformer } from './libs/TransformerClass';
import { Cache } from './libs/CacheClass';
import { DirectLambdaInvocation, Lambda } from './libs/LambdaClass';
import { UserManager } from './managers/UserManager';
import { SnippetManager } from './managers/SnippetManager';
import { BookmarkManager } from './managers/BookmarkManager';

const container = new Container();

container.bind<GotClient>(GotClient).to(GotClient).inSingletonScope();
container.bind<Transformer>(Transformer).to(Transformer).inSingletonScope();
container.bind<NodeManager>(NodeManager).to(NodeManager).inSingletonScope();
container
  .bind<SnippetManager>(SnippetManager)
  .to(SnippetManager)
  .inSingletonScope();
container
  .bind<ShortenerManager>(ShortenerManager)
  .to(ShortenerManager)
  .inSingletonScope();
container.bind<UserManager>(UserManager).to(UserManager).inSingletonScope();
container.bind<Cache>(Cache).to(Cache).inSingletonScope();
container.bind<Lambda>(Lambda).to(Lambda).inSingletonScope();
container
  .bind<DirectLambdaInvocation>(DirectLambdaInvocation)
  .to(DirectLambdaInvocation)
  .inSingletonScope();
container
  .bind<BookmarkManager>(BookmarkManager)
  .to(BookmarkManager)
  .inSingletonScope();
export default container;
