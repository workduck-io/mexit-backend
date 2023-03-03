import got, { OptionsOfJSONResponseBody, OptionsOfTextResponseBody, type Response as GotResponse } from 'got';
import { injectable } from 'inversify';
import StatsMap from 'stats-map';
import mem from 'mem';

@injectable()
export class GotClient {
  private _requestTimeout = 15000;
  private _cache = new StatsMap();

  private _gotConfig: OptionsOfTextResponseBody = {
    retry: {
      calculateDelay: ({ computedValue }) => {
        return computedValue / 10;
      },
    },
    timeout: {
      request: this._requestTimeout,
    },
  };

  private _client = got.extend(this._gotConfig);
  private _memGot = mem(this._client, { cache: this._cache });

  async request(url: string, options: OptionsOfJSONResponseBody): Promise<GotResponse> {
    return await this._memGot(url, options).json();
  }
}
