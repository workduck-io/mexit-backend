import { injectable } from 'inversify';
import { Client } from 'redis-om';
import { ConfigService } from './ConfigService';

@injectable()
export class DbService {
  private static _instance: DbService;
  public _client: Client;
  private MAX_RETRY_LIMIT = 3;

  public static getInstance(): DbService {
    if (!DbService._instance) {
      DbService._instance = new DbService();
    }

    return DbService._instance;
  }

  private async createConnection() {
    this._client = new Client();
    await this._client.open(ConfigService.REDIS_URL);
  }

  public async connect(retry = 0): Promise<void> {
    try {
      await this.createConnection();
    } catch (Error) {
      if (retry <= this.MAX_RETRY_LIMIT) {
        await this.createConnection();
        await this.connect(retry + 1);
      } else {
        throw Error;
      }
    }
  }

  private async closeConnection() {
    await this._client.close();
  }
}
