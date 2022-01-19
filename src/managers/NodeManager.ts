import { injectable } from 'inversify';
import { Block, CommentDetail, NodeDetail } from '../interfaces/Node';
import { ConfigService } from '../services/ConfigService';
import axios, { AxiosResponse } from 'axios';
import { errorlib } from '../libs/errorlib';
import { errorCodes } from '../libs/errorCodes';
import { statusCodes } from '../libs/statusCodes';

@injectable()
export class NodeManager {
  private _urlPath = '/node';
  private _commentUrlPath = '/comment';
  async createNode(
    nodeDetail: NodeDetail,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
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

  async appendNode(
    nodeId: string,
    block: Block,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.post(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/${nodeId}/append`,
        block,
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

  async editBlock(
    nodeId: string,
    block: Block,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.post(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/${nodeId}/blockUpdate`,
        block,
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
  async archivingNode(
    nodeId: string,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.delete(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/archive/${nodeId}`,
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
  async deleteNode(nodeId: string, authToken: string): Promise<AxiosResponse> {
    try {
      const response = await axios.put(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/${nodeId}`,
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
  async getAllArchivedNodes(
    nodeId: string,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.get(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/archive/${nodeId}`,
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
  async unArchivingNode(
    nodeId: string,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.put(
        `${ConfigService.MEX_BACKEND_URL}${this._urlPath}/unarchive/${nodeId}`,
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

  async createComment(
    commentDetail: CommentDetail,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.post(
        `${ConfigService.MEX_BACKEND_URL}${this._commentUrlPath}`,
        commentDetail,
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

  async updateComment(
    commentDetail: CommentDetail,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.patch(
        `${ConfigService.MEX_BACKEND_URL}${this._commentUrlPath}`,
        commentDetail,
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

  async getComment(
    nodeId: string,
    blockId: string,
    commentId: string,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.get(
        `${ConfigService.MEX_BACKEND_URL}${this._commentUrlPath}?nodeID=${nodeId}&blockID=${blockId}&commentID=${commentId}`,
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
  async getAllCommentsForNode(
    nodeId: string,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.get(
        `${ConfigService.MEX_BACKEND_URL}${this._commentUrlPath}/node/${nodeId}`,
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
  async getAllCommentsForBlock(
    nodeId: string,
    blockId: string,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.get(
        `${ConfigService.MEX_BACKEND_URL}${this._commentUrlPath}/node/${nodeId}/block/${blockId}`,
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
  async deleteComment(
    nodeId: string,
    blockId: string,
    commentId: string,
    authToken: string
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.delete(
        `${ConfigService.MEX_BACKEND_URL}${this._commentUrlPath}?nodeID=${nodeId}&blockID=${blockId}&commentID=${commentId}`,
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
}
