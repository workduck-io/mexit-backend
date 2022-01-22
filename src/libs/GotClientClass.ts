import got from 'got';
import { injectable } from 'inversify';
import { GotResponse, GotClientType } from 'src/interfaces/GotClient';

@injectable()
export class GotClient implements GotClientType {
  private requestTimeout = 15000;

  async post<T>(
    url: string,
    payload: T,
    authToken: string
  ): Promise<GotResponse> {
    const result: GotResponse = {
      data: null,
      status: null,
    };
    result.data = await got
      .post(url, {
        json: payload,
        headers: {
          Authorization: authToken,
        },
        hooks: {
          afterResponse: [
            (response, retryWithMergedOptions) => {
              result.status = response.statusCode;
              return response;
            },
          ],
        },
        timeout: {
          request: this.requestTimeout,
        },
      })
      .json();

    return result;
  }

  async delete(url: string, authToken: string): Promise<GotResponse> {
    const result: GotResponse = {
      data: null,
      status: null,
    };
    result.data = await got
      .delete(url, {
        headers: {
          Authorization: authToken,
        },
        hooks: {
          afterResponse: [
            (response, retryWithMergedOptions) => {
              result.status = response.statusCode;
              return response;
            },
          ],
        },
        timeout: {
          request: this.requestTimeout,
        },
      })
      .json();

    return result;
  }
  async put(url: string, authToken: string): Promise<GotResponse> {
    const result: GotResponse = {
      data: null,
      status: null,
    };
    result.data = await got
      .put(url, {
        headers: {
          Authorization: authToken,
        },
        hooks: {
          afterResponse: [
            (response, retryWithMergedOptions) => {
              result.status = response.statusCode;
              return response;
            },
          ],
        },
        timeout: {
          request: this.requestTimeout,
        },
      })
      .json();

    return result;
  }

  async get(url: string, authToken: string): Promise<GotResponse> {
    const result: GotResponse = {
      data: null,
      status: null,
    };
    result.data = await got
      .get(url, {
        headers: {
          Authorization: authToken,
        },
        hooks: {
          afterResponse: [
            (response, retryWithMergedOptions) => {
              result.status = response.statusCode;
              return response;
            },
          ],
        },
        timeout: {
          request: this.requestTimeout,
        },
      })
      .json();

    return result;
  }
}
