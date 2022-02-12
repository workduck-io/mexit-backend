import { injectable } from 'inversify';
import NodeCache from 'node-cache';
import container from '../inversify.config';
import { Transformer } from './TransformerClass';

@injectable()
export class Cache {
  private TTL = 30;
  private _cache;
  private _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    this._cache = new NodeCache({
      stdTTL: this.TTL,
      checkperiod: this.TTL * 0.2,
      maxKeys: 1000,
      useClones: false,
    });
  }

  set(key, entity: string, payload: any) {
    this._cache.set(this._transformer.encodeCacheKey(entity, key), payload);
  }

  get(key, entity: string) {
    return Promise.resolve(
      this._cache.get(this._transformer.encodeCacheKey(entity, key))
    );
  }
  getAndSet(key, entity: string, storeFunction) {
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

  del(key, entity: string) {
    this._cache.del(this._transformer.encodeCacheKey(entity, key));
  }

  flush() {
    this._cache.flushAll();
  }
}
