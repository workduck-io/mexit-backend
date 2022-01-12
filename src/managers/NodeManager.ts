import { injectable } from 'inversify';
import { NodeDetail } from 'src/interfaces/Node';
import { ConfigService } from '../services/ConfigService';
import axios, { AxiosResponse } from 'axios';
import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class NodeManager {
  private _urlPath = '/node';
  async createNode(
    nodeDetail: NodeDetail,
    authToken: string
  ): Promise<AxiosResponse> {
    const response = await axios.post(
      `${ConfigService.MEX_BACKEND_URL}${this._urlPath}`,
      nodeDetail,
      {
        headers: {
          Authorization: authToken,
        },
      }
    );
    return response;
  }

  async appendNode(
    nodeId: string,
    nodeDetail: NodeDetail,
    authToken: string
  ): Promise<AxiosResponse> {
    const response = await axios.post(
      `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/${nodeId}/append`,
      nodeDetail,
      {
        headers: {
          Authorization: authToken,
        },
      }
    );
    return response;
  }
}
