import { Container } from 'inversify';

import { GotClient } from './libs/GotClientClass';
import { Redis } from './libs/RedisClass';
import { Transformer } from './libs/TransformerClass';

const container = new Container({ defaultScope: 'Singleton' });

container.bind<GotClient>(GotClient).to(GotClient);
container.bind<Transformer>(Transformer).to(Transformer);

container.bind<Redis>(Redis).to(Redis);

export default container;
