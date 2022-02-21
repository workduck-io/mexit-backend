import { injectable } from 'inversify';
import NodeCache from 'node-cache';
import { NodeDataResponse, NodeResponse } from '../interfaces/Response';
import container from '../inversify.config';
import { Transformer } from './TransformerClass';

@injectable()
export class Cache {
  private TTL = 1200;
  private refreshPeriod = 1205;
  private maxKeys = 1000;
  private _cache;
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
  async getOrSet(key: string, entity: string, storeFunction) {
    const value = await this._cache.get(
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

  replaceAndSet(key: string, entity: string, value: any) {
    if (this._cache.has(this._transformer.encodeCacheKey(entity, key)))
      this._cache.del(this._transformer.encodeCacheKey(entity, key));

    this._cache.set(this._transformer.encodeCacheKey(entity, key), value);
  }

  has(key: string, entity: string) {
    return this._cache.has(this._transformer.encodeCacheKey(entity, key));
  }

  appendOrCreateActivityNode(
    userId: string,
    activityNodeLabel: string,
    activityNode: NodeResponse,
    activityBlock: NodeDataResponse
  ) {
    //push the latest capture always at the zeroth index
    const insertIndex = 0;
    //No need of deleting anything for this feature
    const deleteCount = 0;
    const hasKey = this._cache.has(
      this._transformer.encodeCacheKey(activityNodeLabel, userId)
    );

    if (hasKey) {
      //take out from the cache
      const cachedActivityNode: any = this._cache.take(
        this._transformer.encodeCacheKey(activityNodeLabel, userId)
      );

      if (cachedActivityNode.data && cachedActivityNode.data.length > 0) {
        const poppedBlock = cachedActivityNode.data.pop();
        // update the endCursor with the popped block
        cachedActivityNode.endCursor = `${cachedActivityNode.id}$${poppedBlock.id}`;
      }
      //update the activitynode
      cachedActivityNode.data.splice(insertIndex, deleteCount, activityBlock);

      //set the updated block again in the cache
      this._cache.set(
        this._transformer.encodeCacheKey(activityNodeLabel, userId),
        cachedActivityNode
      );
      return cachedActivityNode;
    } else {
      this._cache.set(
        this._transformer.encodeCacheKey(activityNodeLabel, userId),
        activityNode
      );
      return activityNode;
    }
  }

  del(key: string, entity: string) {
    this._cache.del(this._transformer.encodeCacheKey(entity, key));
  }
}
