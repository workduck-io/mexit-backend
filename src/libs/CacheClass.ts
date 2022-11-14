import { injectable } from 'inversify';
import NodeCache from 'node-cache';
import container from '../inversify.config';
import { Transformer } from './TransformerClass';

@injectable()
export class Cache {
  private TTL = 1200;
  private refreshPeriod = 1205;
  private maxKeys = 1000;
  private _cache: NodeCache;
  private _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    this._cache = new NodeCache({
      stdTTL: this.TTL,
      checkperiod: this.refreshPeriod,
      maxKeys: this.maxKeys,
      useClones: false,
    });
  }

  set(key: string, entity: string, payload: any) {
    this._cache.set(this._transformer.encodeCacheKey(entity, key), payload);
  }

  get(key: string, entity: string) {
    return Promise.resolve(
      this._cache.get(this._transformer.encodeCacheKey(entity, key))
    );
  }
  has(key: string, entity: string) {
    return this._cache.has(this._transformer.encodeCacheKey(entity, key));
  }

  del(key: string, entity: string) {
    if (this._cache.has(this._transformer.encodeCacheKey(entity, key)))
      this._cache.del(this._transformer.encodeCacheKey(entity, key));
  }

  mget(keys: string[], entity: string) {
    return this._cache.mget(
      keys.map(key => this._transformer.encodeCacheKey(entity, key))
    );
  }

  mdel(keys: string[], entity: string) {
    this._cache.del(
      keys.map(key => this._transformer.encodeCacheKey(entity, key))
    );
  }

  mset(
    items: {
      key: string;
      payload: string;
    }[],
    entity: string
  ) {
    this._cache.mset(
      items.map(item => ({
        key: this._transformer.encodeCacheKey(entity, item.key),
        val: item.payload,
      }))
    );
  }

  async getOrSet<T>(
    key: string,
    entity: string,
    fetchData: Promise<T>,
    forceGet = false
  ): Promise<T> {
    const value = await this._cache.get<T>(
      this._transformer.encodeCacheKey(entity, key)
    );
    if (value && !forceGet) {
      return value as Promise<T>;
    } else {
      const value = await fetchData;
      this._cache.set(this._transformer.encodeCacheKey(entity, key), value);
      return value;
    }
  }

  replaceAndSet(key: string, entity: string, value: any) {
    if (this._cache.has(this._transformer.encodeCacheKey(entity, key)))
      this._cache.del(this._transformer.encodeCacheKey(entity, key));

    this._cache.set(this._transformer.encodeCacheKey(entity, key), value);
  }
}
