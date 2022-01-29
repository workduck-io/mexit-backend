import { injectable } from 'inversify';
import { Block, NodeDetail } from '../interfaces/Node';
import { ConfigService } from '../services/ConfigService';
import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';
import { GotClient } from '../libs/GotClientClass';
import container from '../inversify.config';
import { GotResponse } from '../interfaces/GotClient';
import { Cache } from '../libs/CacheClass';
import Lambda from '../libs/InvokeLambda';
@injectable()
export class NodeManager {
  private _urlPath = '/node';
  public _gotClient: GotClient = container.get<GotClient>(GotClient);
  public _cache: Cache = container.get<Cache>(Cache);
  async createNode(nodeDetail: NodeDetail): Promise<string> {
    try {
      const result = JSON.parse(
        (
          await Lambda.invokeLambdaClient({
            FunctionName: `mex-backend-test-Node`,
            Payload: JSON.stringify({
              body: JSON.stringify(nodeDetail),
              routeKey: 'POST /node',
            }),
            InvocationType: 'RequestResponse',
          })
        ).Payload as string
      );

      return result.body;
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

  async appendNode(
    nodeId: string,
    block: Block,
    authToken: string
  ): Promise<GotResponse> {
    try {
      const response = await this._gotClient.post<Block>(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/${nodeId}/append`,
        block,
        authToken
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

  async editBlock(
    nodeId: string,
    block: Block,
    authToken: string
  ): Promise<GotResponse> {
    try {
      const response = await this._gotClient.post<Block>(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/${nodeId}/blockUpdate`,
        block,
        authToken
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
  async archivingNode(nodeId: string, authToken: string): Promise<GotResponse> {
    try {
      const response = await this._gotClient.delete(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/archive/${nodeId}`,
        authToken
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
  async deleteNode(nodeId: string, authToken: string): Promise<GotResponse> {
    try {
      const response = await this._gotClient.put(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/${nodeId}`,
        authToken
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
  async getAllArchivedNodes(
    nodeId: string,
    authToken: string
  ): Promise<GotResponse> {
    try {
      const response = await this._gotClient.get(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/archive/${nodeId}`,
        authToken
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
  async unArchivingNode(
    nodeId: string,
    authToken: string
  ): Promise<GotResponse> {
    try {
      const response = await this._gotClient.put(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/unarchive/${nodeId}`,
        authToken
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
  async getAllNodes(userId: string, authToken: string): Promise<GotResponse> {
    try {
      const response = await this._cache.get(userId, () =>
        this._gotClient.get(
          `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/all/${userId}`,
          authToken
        )
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

  clearCache(): void {
    try {
      this._cache.flush();
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
}
