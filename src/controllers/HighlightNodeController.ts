import express, { Request, Response } from 'express';
import container from '../inversify.config';
import { HighlightNodeManager } from '../managers/HighlightNodeManager';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';

class HighlightNodeController {
  public _urlPath = '/highlightnode';
  public _router = express.Router();
  public _highlightNodeManager: HighlightNodeManager =
    container.get<HighlightNodeManager>(HighlightNodeManager);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.post(this._urlPath, this.createHighlightNode);
    this._router.get(
      `${this._urlPath}/:highlightNodeId`,
      this.getHighlightNode
    );
    return;
  }

  createHighlightNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'HighlightNodeDetail');
      const result = await this._highlightNodeManager.addHighlightNode(
        requestDetail.data.pageUrl,
        requestDetail.data.range
      );
      response.status(statusCodes.OK).send(result);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  getHighlightNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const result = await this._highlightNodeManager.getHighlightNode(
        request.params.highlightNodeId
      );
      response.status(statusCodes.OK).send(result);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
}

export default HighlightNodeController;
