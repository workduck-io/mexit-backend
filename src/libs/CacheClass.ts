import { injectable } from 'inversify';
import NodeCache from 'node-cache';
import container from '../inversify.config';
import { Transformer } from './TransformerClass';

@injectable()
export class Cache {
  private TTL = 1200;
  private _cache;
  private _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    this._cache = new NodeCache({
      stdTTL: this.TTL,
      checkperiod: this.TTL * 0.2,
      useClones: false,
    });
  }
  get(key, entity: string, storeFunction) {
    const value = this._cache.get(
      this._transformer.encodeCacheKey(entity, key)
    );
    if (value) {
      return Promise.resolve(value);
    }

    return storeFunction().then(result => {
      this._cache.set(this._transformer.encodeCacheKey(entity, key), result);
      return result;
    });
  }

  del(keys) {
    this._cache.del(keys);
  }

  flush() {
    this._cache.flushAll();
  }
}
