import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

import container from '../inversify.config';
import { NodeManager } from '../managers/NodeManager';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { AuthRequest } from '../middlewares/authrequest';
import { Transformer } from '../libs/TransformerClass';
import { SearchResults } from '../interfaces/Search';

class SearchController {
  public _urlPath = '/search';
  public _router = express.Router();
  //   public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);
  //   public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.get(this._urlPath, [AuthRequest], this.searchIndex);
  }
  searchIndex = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const userEmail = response.locals.userEmail;
    const index = crypto.createHash('md5').update(userEmail).digest('hex');

    response.json({
      userEmail: userEmail,
      index: index,
    });
  };

  //     this._router.post(
  //       `${this._urlPath}/:nodeId/append`,
  //       [AuthRequest],
  //       this.appendNode
  //     );
  //     this._router.post(
  //       `${this._urlPath}/:nodeId/blockUpdate`,
  //       [AuthRequest],
  //       this.editBlockInNode
  //     );
  //     this._router.post(
  //       `${this._urlPath}/link`,
  //       [AuthRequest],
  //       this.createLinkNode
  //     );
  //     this._router.post(
  //       `${this._urlPath}/content`,
  //       [AuthRequest],
  //       this.createContentNode
  //     );
  //     this._router.get(`${this._urlPath}/:nodeId`, [AuthRequest], this.getNode);
  //     this._router.get(
  //       `${this._urlPath}/all/:userId`,
  //       [AuthRequest],
  //       this.getAllNodes
  //     );
  //     this._router.get(
  //       `${this._urlPath}/clearcache`,
  //       [AuthRequest],
  //       this.clearCache
  //     );
  //     return;
  //   }

  //   createNode = async (request: Request, response: Response): Promise<void> => {
  //     try {
  //       const requestDetail = new RequestClass(request, 'ClientNode');
  //       const nodeDetail = this._transformer.convertClientNodeToNodeFormat(
  //         requestDetail.data
  //       );

  //       const nodeResult = await this._nodeManager.createNode(nodeDetail);

  //       const result = this._transformer.convertNodeToClientNodeFormat(
  //         JSON.parse(nodeResult) as NodeResponse
  //       );
  //       response
  //         .contentType('application/json')
  //         .status(statusCodes.OK)
  //         .send(result);
  //     } catch (error) {
  //       response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
  //     }
  //   };

  //   appendNode = async (request: Request, response: Response): Promise<void> => {
  //     try {
  //       const requestDetail = new RequestClass(request, 'Block');
  //       const result = await this._nodeManager.appendNode(
  //         request.params.nodeId,
  //         requestDetail.data
  //       );
  //       response
  //         .contentType('application/json')
  //         .status(statusCodes.OK)
  //         .send(result);
  //     } catch (error) {
  //       response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
  //     }
  //   };

  //   editBlockInNode = async (
  //     request: Request,
  //     response: Response
  //   ): Promise<void> => {
  //     try {
  //       const requestDetail = new RequestClass(request, 'Block');
  //       const result = await this._nodeManager.editBlock(
  //         request.params.nodeId,
  //         requestDetail.data
  //       );
  //       response
  //         .contentType('application/json')
  //         .status(statusCodes.OK)
  //         .send(result);
  //     } catch (error) {
  //       response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
  //     }
  //   };

  //   createLinkNode = async (
  //     request: Request,
  //     response: Response
  //   ): Promise<void> => {
  //     try {
  //       const requestDetail = new RequestClass(request, 'LinkNodeRequest');
  //       const nodeDetail = this._transformer.convertLinkToNodeFormat(
  //         requestDetail.data
  //       );
  //       const resultNodeDetail = await this._nodeManager.createNode(nodeDetail);
  //       const resultLinkNodeDetail = this._transformer.convertNodeToLinkFormat(
  //         JSON.parse(resultNodeDetail) as NodeResponse
  //       );
  //       response
  //         .contentType('application/json')
  //         .status(statusCodes.OK)
  //         .send(resultLinkNodeDetail);
  //     } catch (error) {
  //       response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
  //     }
  //   };
  //   createContentNode = async (
  //     request: Request,
  //     response: Response
  //   ): Promise<void> => {
  //     try {
  //       const requestDetail = new RequestClass(request, 'ContentNodeRequest');
  //       const nodeDetail = this._transformer.convertContentToNodeFormat(
  //         requestDetail.data
  //       );
  //       const resultNodeDetail = await this._nodeManager.createNode(nodeDetail);
  //       const resultLinkNodeDetail = this._transformer.convertNodeToContentFormat(
  //         JSON.parse(resultNodeDetail) as NodeResponse
  //       );
  //       response
  //         .contentType('application/json')
  //         .status(statusCodes.OK)
  //         .send(resultLinkNodeDetail);
  //     } catch (error) {
  //       response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
  //     }
  //   };

  //   getAllNodes = async (request: Request, response: Response): Promise<void> => {
  //     try {
  //       const result = await this._nodeManager.getAllNodes(request.params.userId);
  //       response
  //         .contentType('application/json')
  //         .status(statusCodes.OK)
  //         .send(result);
  //     } catch (error) {
  //       response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
  //     }
  //   };
  //   getNode = async (request: Request, response: Response): Promise<void> => {
  //     try {
  //       const result = await this._nodeManager.getNode(request.params.nodeId);
  //       const nodeResponse = JSON.parse(result) as NodeResponse;
  //       const convertedResponse =
  //         this._transformer.genericNodeConverter(nodeResponse);
  //       response
  //         .contentType('application/json')
  //         .status(statusCodes.OK)
  //         .send(convertedResponse);
  //     } catch (error) {
  //       response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
  //     }
  //   };
  //   //TODO: ClearCache not working have to fix this
  //   clearCache = (response: Response): void => {
  //     try {
  //       this._nodeManager.clearCache();
  //     } catch (error) {
  //       response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
  //     }
  //   };
}

export default SearchController;
