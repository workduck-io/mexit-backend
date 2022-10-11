import { Container } from 'inversify';
import { CacheType } from './interfaces/Config';
import { Cache } from './libs/CacheClass';
import { GotClient } from './libs/GotClientClass';
import { Lambda } from './libs/LambdaClass';
import { Transformer } from './libs/TransformerClass';
import { BookmarkManager } from './managers/BookmarkManager';
import { NamespaceManager } from './managers/NamespaceManager';
import { NodeManager } from './managers/NodeManager';
import { SharedManager } from './managers/SharedManager';
import { ShortenerManager } from './managers/ShortenerManager';
import { SnippetManager } from './managers/SnippetManager';
import { TagManager } from './managers/TagManager';
import { UserManager } from './managers/UserManager';
import { ViewManager } from './managers/ViewManager';

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
container.bind<TagManager>(TagManager).to(TagManager).inSingletonScope();
container
  .bind<SharedManager>(SharedManager)
  .to(SharedManager)
  .inSingletonScope();
container.bind<UserManager>(UserManager).to(UserManager).inSingletonScope();
container
  .bind<Cache>(CacheType.NamespaceHierarchy)
  .to(Cache)
  .inSingletonScope();
container.bind<Cache>(CacheType.Node).to(Cache).inSingletonScope();
container.bind<Lambda>(Lambda).to(Lambda).inSingletonScope();
container
  .bind<BookmarkManager>(BookmarkManager)
  .to(BookmarkManager)
  .inSingletonScope();
container
  .bind<NamespaceManager>(NamespaceManager)
  .to(NamespaceManager)
  .inSingletonScope();
container.bind<ViewManager>(ViewManager).to(ViewManager).inSingletonScope();
export default container;
