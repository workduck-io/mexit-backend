import { inject, injectable } from 'inversify';
import { Repository } from 'redis-om';
import { DbService } from '../services/DbService';
import { highlightNodeSchema, HighlightNode } from '../entities/HighlightNode';

@injectable()
export class HighlightNodeManager {
  private _dbService: DbService;
  public repository: Repository<HighlightNode>;

  constructor(@inject(DbService) dbService: DbService) {
    this._dbService = dbService;
    this.repository = new Repository(
      highlightNodeSchema,
      this._dbService._client
    );
  }

  initRepository(): Repository<HighlightNode> {
    return new Repository(highlightNodeSchema, this._dbService._client);
  }

  async addHighlightNode(
    pageUrl: string,
    range: string
  ): Promise<HighlightNode> {
    try {
      const repository = this.initRepository();
      const highlightNode = repository.createEntity();
      highlightNode.highlightRange = range;
      highlightNode.pageUrl = pageUrl;

      const highlightNodeId = await repository.save(highlightNode);
      return this.getHighlightNode(highlightNodeId);
    } catch (error) {
      console.log(error);
    }
  }

  async getHighlightNode(highlightNodeId: string): Promise<HighlightNode> {
    try {
      const repository = this.initRepository();
      return await repository.fetch(highlightNodeId);
    } catch (error) {
      console.log(error);
    }
  }
}
