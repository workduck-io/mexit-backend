import { injectable } from 'inversify';
import { NodeDetail } from 'src/interfaces/Node';
import { ConfigService } from '../services/ConfigService';
import axios, { AxiosResponse } from 'axios';

@injectable()
export class NodeManager {
  private _urlPath = '/node';
  async createNode(nodeDetail: NodeDetail): Promise<AxiosResponse> {
    const response = await axios.post(
      `${ConfigService.MEX_BACKEND_URL}+${this._urlPath}`,
      nodeDetail
    );
    return response;
  }
}
