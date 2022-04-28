import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { MeiliSearch, Index, SearchResponse } from 'meilisearch';
import { statusCodes } from '../libs/statusCodes';
import { SearchResults } from '../interfaces/Search';
import { initializeSearchRoutes } from '../routes/SearchRoutes';

class SearchController {
  public _urlPath = '/search';
  public _router = express.Router();

  private _client: MeiliSearch;

  constructor() {
    initializeSearchRoutes(this);
    this._client = this._initMeilisearch();
  }

  private _initMeilisearch() {
    if (!process.env.MEILISEARCH_API_KEY)
      throw new Error('Meilisearch API Key Not Provided');

    const client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST ?? 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY,
    });

    return client;
  }

  private _convertSearchResults = (data: SearchResponse): SearchResults => {
    return {
      hits: data.hits as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      count: data.hits.length,
      total: data.nbHits,
    };
  };
  searchIndex = async (
    request: Request,
    response: Response
  ): Promise<SearchResults> => {
    const userEmail = response.locals.userEmail;
    const userHash = crypto.createHash('md5').update(userEmail).digest('hex');
    const query = request.query.q as string;

    let index: Index;

    try {
      index = await this._client.getIndex(userHash);

      const searchResults = await index.search(query, {
        matches: true,
      });

      response.json(this._convertSearchResults(searchResults));
    } catch (err) {
      response
        .status(statusCodes.BAD_REQUEST)
        .send({ ...err, message: 'USER_NOT_FOUND' })
        .json();
      return;
    }
  };
}

export default SearchController;
