import got, { OptionsOfTextResponseBody } from 'got';
import { injectable } from 'inversify';
import { GotResponse, GotClientType } from 'src/interfaces/GotClient';
import StatsMap from 'stats-map';
import mem from 'mem';
@injectable()
export class GotClient implements GotClientType {
  private _requestTimeout = 15000;
  private _gotResponse: GotResponse = { data: null, status: null };
  private _cache = new StatsMap();
  private _memGot = mem(got, { cache: this._cache });

  private _gotConfig: OptionsOfTextResponseBody = {
    hooks: {
      afterResponse: [
        (response, _) => {
          this._gotResponse.status = response.statusCode;
          return response;
        },
      ],
    },
    retry: {
      calculateDelay: ({ computedValue }) => {
        return computedValue / 10;
      },
    },
    timeout: {
      request: this._requestTimeout,
    },
    cache: new Map(),
  };

  async post<T>(
    url: string,
    payload: T,
    authToken: string
  ): Promise<GotResponse> {
    this._gotResponse.data = await this._memGot
      .post(url, {
        json: payload,
        headers: {
          Authorization: authToken,
        },
        ...this._gotConfig,
      })
      .json();

    return this._gotResponse;
  }

  async delete(url: string, authToken: string): Promise<GotResponse> {
    this._gotResponse.data = await this._memGot
      .delete(url, {
        headers: {
          Authorization: authToken,
        },
        ...this._gotConfig,
      })
      .json();

    return this._gotResponse;
  }
  async put(url: string, authToken: string): Promise<GotResponse> {
    this._gotResponse.data = await this._memGot
      .put(url, {
        headers: {
          Authorization: authToken,
        },
        ...this._gotConfig,
      })
      .json();

    return this._gotResponse;
  }

  async get(url: string, authToken: string): Promise<GotResponse> {
    this._gotResponse.data = await this._memGot
      .get(url, {
        headers: {
          Authorization: authToken,
        },
        ...this._gotConfig,
      })
      .json();

    return this._gotResponse;
  }
}
