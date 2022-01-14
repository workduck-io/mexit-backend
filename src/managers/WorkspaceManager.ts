import { injectable } from 'inversify';
import { ConfigService } from '../services/ConfigService';
import axios, { AxiosResponse } from 'axios';
import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
import { Namespace, Workspace } from '../interfaces/WorkSpace';

@injectable()
export class WorkspaceManager {
  private _urlPath = '/workspace';
  private _namespaceUrlPath = '/namespace';
  async createWorkspace(
    workspaceDetail: Workspace,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.post(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}`,
        workspaceDetail,
        {
          headers: {
            Authorization: authToken,
          },
        }
      );
      return response;
    } catch (error) {
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
  async createNamespace(
    nameSpaceDetail: Namespace,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.post(
        `${ConfigService.MEX_BACKEND_URL}${this._namespaceUrlPath}`,
        nameSpaceDetail,
        {
          headers: {
            Authorization: authToken,
          },
        }
      );
      return response;
    } catch (error) {
      console.log({ error });
      errorlib({
        message: error.message,
        errorCode: errorCodes.UNKNOWN,
        errorObject: error,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        metaData: error.message,
      });
    }
  }
}
