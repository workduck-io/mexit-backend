import { injectable } from 'inversify';
import { createClient, RedisClientType } from 'redis';

@injectable()
export class Redis {
  client: RedisClientType;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.MEXIT_BACKEND_REDIS_HOST,
        port: +process.env.MEXIT_BACKEND_REDIS_PORT,
      },
    });
  }
  /**
   * Returns a promise that resolve with cache or concrete data from a given callback function
   *
   * Example
   * ```typescript
   * const redisKey = 'randomKey';
   * const expireInSeconds = 1000; // 1seg TTL
   * return res.status(OK).send(
   *   await this.redis.withRedis({ key: redisKey, expires: expireInSeconds }, async () => {
   *     return this.find({});
   *   }),
   * );
   * ```
   * @param params.key Redis Key
   * @param params.expires TTL value for given key
   * @param callback Function that returns something and save it on redis in case cache is empty
   */
  async getOrSet<T>(
    params: { key: string; expires?: number; force?: boolean },
    callback: () => Promise<T>
  ): Promise<T> {
    try {
      const cache = params.force ? undefined : await this.get<T>(params.key);
      if (!cache) {
        const result = await callback();
        if (params.expires) {
          this.setEx(params.key, result, params.expires);
        } else {
          this.set(params.key, result);
        }
        return result;
      }
      return cache;
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * Get a value from a key in redis using GET command
   * @param key Key
   * @param defaultValue Return this if no value for given key are found
   */
  get<T>(key: string, defaultValue?: T): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.client.get(key);
        if (result) {
          resolve(JSON.parse(result));
        } else {
          resolve(defaultValue);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  /**
   * Set a key in redis using SET command
   * @param key Key
   * @param value Value
   */
  async set(key: string, value: any) {
    this.client.set(key, JSON.stringify(value));
  }
  /**
   * Set a key in redis using SETEX command
   *
   * Useful to set a expire timer on key
   * @param key Key
   * @param value Value
   * @param ttl Time To Live (in seconds)
   */
  async setEx(key: any, value: any, ttl: number) {
    this.client.setEx(key, ttl, JSON.stringify(value));
  }

  async has(key: string) {
    return this.client.exists(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async mget(keys: string[]) {
    if (keys.length > 0) return await this.client.mGet(keys);
    return [];
  }

  async mdel(keys: string[]) {
    if (keys.length > 0) return this.client.del(keys);
  }

  async mset(items: { [key: string]: string }) {
    if (Object.keys(items).length > 0) return this.client.mSet(items);
    return [];
  }
}
