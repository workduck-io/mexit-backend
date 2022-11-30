import { Container } from 'inversify';
import { GotClient } from './libs/GotClientClass';
import { Lambda } from './libs/LambdaClass';
import { Redis } from './libs/RedisClass';
import { Transformer } from './libs/TransformerClass';
import { BookmarkManager } from './managers/BookmarkManager';
import { CommentManager } from './managers/CommentManager';
import { LinkManager } from './managers/LinkManager';
import { NamespaceManager } from './managers/NamespaceManager';
import { NodeManager } from './managers/NodeManager';
import { ReactionManager } from './managers/ReactionManager';
import { ReminderManager } from './managers/ReminderManager';
import { SharedManager } from './managers/SharedManager';
import { SmartCaptureManager } from './managers/SmartCaptureManager';
import { SnippetManager } from './managers/SnippetManager';
import { TagManager } from './managers/TagManager';
import { UserManager } from './managers/UserManager';
import { ViewManager } from './managers/ViewManager';

const container = new Container({ defaultScope: 'Singleton' });

container.bind<GotClient>(GotClient).to(GotClient);
container.bind<Transformer>(Transformer).to(Transformer);
container.bind<NodeManager>(NodeManager).to(NodeManager);
container.bind<SnippetManager>(SnippetManager).to(SnippetManager);

container.bind<LinkManager>(LinkManager).to(LinkManager);
container.bind<TagManager>(TagManager).to(TagManager);
container.bind<SharedManager>(SharedManager).to(SharedManager);

container
  .bind<SmartCaptureManager>(SmartCaptureManager)
  .to(SmartCaptureManager);
container.bind<UserManager>(UserManager).to(UserManager);

container.bind<Redis>(Redis).to(Redis);
container.bind<Lambda>(Lambda).to(Lambda);

container.bind<NamespaceManager>(NamespaceManager).to(NamespaceManager);

container.bind<ViewManager>(ViewManager).to(ViewManager);
container.bind<ReminderManager>(ReminderManager).to(ReminderManager);

container.bind<CommentManager>(CommentManager).to(CommentManager);

container.bind<ReactionManager>(ReactionManager).to(ReactionManager);

container.bind<BookmarkManager>(BookmarkManager).to(BookmarkManager);

export default container;
