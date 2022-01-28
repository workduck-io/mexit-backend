import { injectable } from 'inversify';
import NodeCache from 'node-cache';

@injectable()
export class Cache {
  private TTL = 1200;
  private _cache;

  constructor() {
    this._cache = new NodeCache({
      stdTTL: this.TTL,
      checkperiod: this.TTL * 0.2,
      useClones: false,
    });
  }
  get(key, storeFunction) {
    const value = this._cache.get(key);
    if (value) {
      return Promise.resolve(value);
    }

    return storeFunction().then(result => {
      this._cache.set(key, result);
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
