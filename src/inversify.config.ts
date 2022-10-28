import { Container } from 'inversify';
import { CacheType } from './interfaces/Config';
import { Cache } from './libs/CacheClass';
import { GotClient } from './libs/GotClientClass';
import { Lambda } from './libs/LambdaClass';
import { Transformer } from './libs/TransformerClass';
import { BookmarkManager } from './managers/BookmarkManager';
import { CommentManager } from './managers/CommentManager';
import { LinkManager } from './managers/LinkManager';
import { NamespaceManager } from './managers/NamespaceManager';
import { NodeManager } from './managers/NodeManager';
import { ReactionManager } from './managers/ReactionManager';
import { ReminderManager } from './managers/ReminderManager';
import { SharedManager } from './managers/SharedManager';
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
container.bind<LinkManager>(LinkManager).to(LinkManager).inSingletonScope();
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
container.bind<Cache>(CacheType.UserAccess).to(Cache).inSingletonScope();
container.bind<Cache>(CacheType.Snippet).to(Cache).inSingletonScope();
container.bind<Cache>(CacheType.UserAccessType).to(Cache).inSingletonScope();
container.bind<Lambda>(Lambda).to(Lambda).inSingletonScope();

container
  .bind<NamespaceManager>(NamespaceManager)
  .to(NamespaceManager)
  .inSingletonScope();
container.bind<ViewManager>(ViewManager).to(ViewManager).inSingletonScope();
container
  .bind<ReminderManager>(ReminderManager)
  .to(ReminderManager)
  .inSingletonScope();

container
  .bind<CommentManager>(CommentManager)
  .to(CommentManager)
  .inSingletonScope();
container
  .bind<ReactionManager>(ReactionManager)
  .to(ReactionManager)
  .inSingletonScope();
container
  .bind<BookmarkManager>(BookmarkManager)
  .to(BookmarkManager)
  .inSingletonScope();

export default container;
