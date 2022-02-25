/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from 'express';
import { nanoid } from 'nanoid';

import container from '../inversify.config';
import { NodeManager } from '../managers/NodeManager';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { AuthRequest } from '../middlewares/authrequest';
import { Transformer } from '../libs/TransformerClass';
import { ShortenerManager } from '../managers/ShortenerManager';
import { serializeContent } from '../libs/serialize';
import { NodeResponse } from '../interfaces/Response';
import { Cache } from '../libs/CacheClass';
import _ from 'lodash';
import { NodeDetail, QueryStringParameters } from '../interfaces/Node';

class NodeController {
  public _urlPath = '/node';
  public _router = express.Router();
  public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);
  public _shortenerManager: ShortenerManager =
    container.get<ShortenerManager>(ShortenerManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);
  private _cache: Cache = container.get<Cache>(Cache);
  private _allNodesEntityLabel = 'ALLNODES';
  private _activityNodeLabel = 'ACTIVITYNODE';
  private _defaultActivityBlockCacheSize = 5;

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.post(this._urlPath, [AuthRequest], this.createNode);

    this._router.post(
      `${this._urlPath}/:nodeId/append`,
      [AuthRequest],
      this.appendNode
    );

    this._router.post(
      `${this._urlPath}/capture`,
      [AuthRequest],
      this.newCapture
    );

    this._router.post(
      `${this._urlPath}/capture/link`,
      [AuthRequest],
      this.createLinkCapture
    );

    this._router.post(
      `${this._urlPath}/:nodeId/blockUpdate`,
      [AuthRequest],
      this.editBlockInNode
    );

    this._router.post(
      `${this._urlPath}/content`,
      [AuthRequest],
      this.createContentNode
    );
    this._router.get(
      `${this._urlPath}/getactivityblocks`,
      [AuthRequest],
      this.getLastNActivityBlocks
    );
    this._router.get(`${this._urlPath}/:nodeId/`, [AuthRequest], this.getNode);
    this._router.get(
      `${this._urlPath}/all/:userId`,
      [AuthRequest],
      this.getAllNodes
    );
    this._router.post(
      `${this._urlPath}/activitynode`,
      [AuthRequest],
      this.createActivityNodeForUser
    );
    this._router.post(
      `${this._urlPath}/block/movement`,
      [AuthRequest],
      this.copyOrMoveBlock
    );
    return;
  }

  /**
   *
   * @param request
   * @param response
   * Get the last n blocks of the activity blocks from the mex backend
   */
  getLastNActivityBlocks = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const minBlockSizeRequested = 5;
      if (!request.query.blockSize)
        throw new Error('blockSize query param missing');
      if (!request.headers.userid) throw new Error('userid header missing');

      const blockSize =
        parseInt(request.query.blockSize.toString()) < minBlockSizeRequested
          ? minBlockSizeRequested
          : parseInt(request.query.blockSize.toString());
      const userId = request.headers.userid.toString();

      const defaultQueryStringParameters: QueryStringParameters = {
        blockSize: blockSize,
        getMetaDataOfNode: true,
        getReverseOrder: false,
      };

      if (this._cache.has(userId, this._activityNodeLabel)) {
        const cachedResult: any = await this._cache.get(
          userId,
          this._activityNodeLabel
        );
        // If only partial blocks are available in the cache then fetch them
        if (
          cachedResult.data &&
          cachedResult.data?.length < blockSize &&
          cachedResult.endCursor
        ) {
          // calculate the params for querying the remaining blocks
          const noOfActivityBlocks = blockSize - cachedResult.data.length;

          //cursor consists of the nodeId$blockId replace the '#' delimiter to '$'
          const cursor = cachedResult.endCursor
            ? cachedResult.endCursor.replace(/#/g, '$')
            : null;

          //Query the backend for the remaining activity node blocks.
          const remainingActivityBlocks: any = JSON.parse(
            await this._nodeManager.getNode(userId, {
              ...defaultQueryStringParameters,
              blockSize: noOfActivityBlocks,
              ...(cursor && { startCursor: cursor }),
            })
          );

          // Append with the cached blocks from the last
          // used cloneDeep from lodash to clone the object or else it
          // creates a reference to the cache
          const tempCacheStore: any = _.cloneDeep(cachedResult);
          tempCacheStore.data.push(...remainingActivityBlocks.data);
          tempCacheStore.endCursor = remainingActivityBlocks.endCursor
            ? remainingActivityBlocks.endCursor.replace(/#/g, '$')
            : null;

          const deserialisedContent =
            this._transformer.genericNodeConverter(tempCacheStore);

          response
            .contentType('application/json')
            .status(statusCodes.OK)
            .send(deserialisedContent);
          return;
        }

        const deserialisedContent = this._transformer.genericNodeConverter(
          _.cloneDeep(cachedResult)
        );

        // return the unmodified cache value
        response
          .contentType('application/json')
          .status(statusCodes.OK)
          .send(deserialisedContent);
      } else {
        // If the blocks are not in the cache then query the backend and
        // set the cache and return
        const result = JSON.parse(
          await this._nodeManager.getNode(userId, defaultQueryStringParameters)
        );

        const cachePayload = _.cloneDeep(result);

        cachePayload.data = result.data.filter((data, index) =>
          index < this._defaultActivityBlockCacheSize ? data : null
        );

        if (result.data.length === this._defaultActivityBlockCacheSize)
          cachePayload.endCursor = result.endCursor;
        else
          cachePayload.endCursor = result.endCursor
            ? `${result.id}$${result.data[cachePayload.data.length].id}`
            : null;

        this._cache.set(userId, this._activityNodeLabel, cachePayload);

        const deserialisedContent =
          this._transformer.genericNodeConverter(result);

        response
          .contentType('application/json')
          .status(statusCodes.OK)
          .send(deserialisedContent);
      }
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
  };

  /**
   *
   * @param request
   * @param response
   *
   * mex-backend, so this endpoint will not work for the time being
   * Currently the activitynode changes are not deployed to the test stage of the
   */
  createActivityNodeForUser = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers.userid) throw new Error('userid header missing');
      if (!request.headers.workspaceidentifier)
        throw new Error('workspace identifier header missing');
      // Cognito userId will be the activityNodeid
      const userId = `NODE_${request.headers.userid.toString()}`;
      const workspaceIdentifier =
        request.headers.workspaceidentifier.toString();
      const activityNodeDetail: NodeDetail = {
        id: userId,
        workspaceIdentifier,
        namespaceIdentifier: '#mex-it',
        data: [],
        lastEditedBy: response.locals.userEmail,
        type: 'NodeRequest',
      };

      const result = JSON.parse(
        await this._nodeManager.createNode(activityNodeDetail)
      ) as NodeResponse;

      this._cache.replaceAndSet(userId, this._activityNodeLabel, result.data);

      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(result);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send(JSON.stringify(error));
    }
  };

  newCapture = async (request: Request, response: Response): Promise<void> => {
    try {
      if (!request.headers.userid) throw new Error('userid header missing');
      const reqBody = request.body;
      const type = reqBody.type;
      const defaultQueryStringParameters: QueryStringParameters = {
        blockSize: this._defaultActivityBlockCacheSize,
        getMetaDataOfNode: true,
        getReverseOrder: true,
      };

      switch (type) {
        case 'DRAFT': {
          const activityNodeUID = reqBody.id;

          const activityNodeDetail = {
            type: 'ElementRequest',
            elements: serializeContent(reqBody.content),
          };

          activityNodeDetail.elements.forEach(e => {
            e.createdBy = response.locals.userEmail;
          });

          // append the blocks to the activity node
          await this._nodeManager.appendNode(
            activityNodeUID,
            activityNodeDetail
          );

          const updatedNode = JSON.parse(
            await this._nodeManager.getNode(
              activityNodeUID,
              defaultQueryStringParameters
            )
          );

          // append the latest capture into the cache if not already present
          // set the newly created capture
          const updatedCacheNode = this._cache.appendOrCreateActivityNode(
            activityNodeUID,
            this._activityNodeLabel,
            updatedNode as NodeResponse,
            updatedNode.data.filter((data, index) =>
              index < activityNodeDetail.elements.length ? data : null
            )[0]
          );

          const deserialisedContent = this._transformer.genericNodeConverter(
            _.cloneDeep(updatedCacheNode)
          );

          response.json(deserialisedContent).status(statusCodes.OK);
          break;
        }

        case 'HIERARCHY': {
          const activityNodeUID = reqBody.id;

          const activityNodeDetail = {
            type: 'ElementRequest',
            elements: serializeContent(reqBody.content),
          };

          activityNodeDetail.elements.forEach(e => {
            e.createdBy = response.locals.userEmail;
          });

          const activityPromise = this._nodeManager.appendNode(
            activityNodeUID,
            activityNodeDetail
          );

          let hierarchyPromise: Promise<string>;

          if (reqBody.createNodeUID) {
            const nodeDetail = {
              id: reqBody.createNodeUID,
              // nodePath: reqBody.nodePath,
              type: 'NodeRequest',
              lastEditedBy: response.locals.userEmail,
              namespaceIdentifier: 'NAMESPACE1',
              workspaceIdentifier: reqBody.workspaceIdentifier,
              data: serializeContent(reqBody.content),
              metadata: reqBody.metadata,
            };

            hierarchyPromise = this._nodeManager.createNode(nodeDetail);
          } else if (reqBody.appendNodeUID) {
            const appendDetail = {
              type: 'ElementRequest',
              elements: serializeContent(reqBody.content),
            };

            appendDetail.elements.forEach(e => {
              e.createdBy = response.locals.userEmail;
            });

            hierarchyPromise = this._nodeManager.appendNode(
              reqBody.appendNodeUID,
              appendDetail
            );
          }

          const rawResults = await Promise.all([
            activityPromise,
            hierarchyPromise,
          ]);

          const newNode: NodeResponse = JSON.parse(rawResults[1]);

          if (newNode) {
            if (
              this._cache.has(
                request.headers.userid.toString(),
                this._allNodesEntityLabel
              )
            ) {
              //update the cache for the get all nodes
              const allNodes: any[] = JSON.parse(
                await this._cache.get(
                  request.headers.userid.toString(),
                  this._allNodesEntityLabel
                )
              );
              allNodes.push(newNode.id);
              this._cache.set(
                request.headers.userid.toString(),
                this._allNodesEntityLabel,
                allNodes
              );
            }
          }

          const updatedNode = JSON.parse(
            await this._nodeManager.getNode(
              activityNodeUID,
              defaultQueryStringParameters
            )
          );

          // append the latest capture into the cache if not already present
          // set the newly created capture
          const updatedCacheNode = this._cache.appendOrCreateActivityNode(
            activityNodeUID,
            this._activityNodeLabel,
            updatedNode as NodeResponse,
            updatedNode.data.filter((data, index) =>
              index < activityNodeDetail.elements.length ? data : null
            )[0]
          );

          //updating the results
          rawResults[0] = JSON.stringify(updatedCacheNode);

          // deserialise the node results
          const resp = rawResults.map(resp => {
            if (resp) {
              const deserialisedContent =
                this._transformer.genericNodeConverter(JSON.parse(resp));
              return deserialisedContent;
            } else return {};
          });

          response.json(resp).status(statusCodes.OK);
          break;
        }
      }
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  createLinkCapture = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const reqBody = new RequestClass(request, 'LinkCapture').data;
      const activityNodeUID = reqBody.id;

      delete reqBody.id;
      const shortenerResp = await this._shortenerManager.createNewShort(
        reqBody
      );
      const shortenedURL = JSON.parse(shortenerResp).message;

      if (shortenedURL === 'URL already exists') {
        response.status(statusCodes.BAD_REQUEST).json({
          message: 'Alias Already Exists',
        });
        return;
      }

      const activityNodeDetail = {
        type: 'ElementRequest',
        elements: [
          {
            id: `BLOCK_${nanoid()}`,
            elementType: 'h1',
            createdBy: response.locals.userEmail,
            children: [{ id: `TEMP_${nanoid()}`, content: shortenedURL }],
          },
          {
            id: `BLOCK_${nanoid()}`,
            elementType: 'p',
            createdBy: response.locals.userEmail,
            children: [
              {
                id: `TEMP_${nanoid()}`,
                content: '',
              },
              {
                id: `TEMP_${nanoid()}`,
                elementType: 'a',
                properties: {
                  url: reqBody.long,
                },
                children: [
                  {
                    id: `TEMP_${nanoid()}`,
                    content: reqBody.long,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = await this._nodeManager.appendNode(
        activityNodeUID,
        activityNodeDetail
      );

      const resp = JSON.parse(result);
      resp.shortenedURL = shortenedURL;
      response.json(resp);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  createNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ContentNodeRequest');

      const nodeDetail = {
        id: requestDetail.data.id,
        type: 'NodeRequest',
        lastEditedBy: response.locals.userEmail,
        namespaceIdentifier: 'NAMESPACE1',
        workspaceIdentifier: requestDetail.data.workspaceIdentifier,
        data: serializeContent(requestDetail.data.content),
      };

      const nodeResult = await this._nodeManager.createNode(nodeDetail);

      const deserialisedContent = this._transformer.genericNodeConverter(
        JSON.parse(nodeResult)
      );
      response.json(deserialisedContent);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  appendNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ContentNodeRequest');
      const appendDetail = {
        type: 'ElementRequest',
        elements: serializeContent(requestDetail.data.content),
      };

      appendDetail.elements.forEach(e => {
        e.createdBy = response.locals.userEmail;
      });

      const result = await this._nodeManager.appendNode(
        requestDetail.data.appendNodeUID,
        appendDetail
      );

      response.json(result);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  editBlockInNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'Block');
      const result = await this._nodeManager.editBlock(
        request.params.nodeId,
        requestDetail.data
      );
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(result);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  createContentNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ContentNodeRequest');
      const nodeDetail = this._transformer.convertContentToNodeFormat(
        requestDetail.data
      );

      const resultNodeDetail = await this._nodeManager.createNode(nodeDetail);
      const resultContentNodeDetail =
        this._transformer.convertNodeToContentFormat(
          JSON.parse(resultNodeDetail) as NodeResponse
        );

      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(resultContentNodeDetail);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };

  getAllNodes = async (request: Request, response: Response): Promise<void> => {
    try {
      const result = await this._cache.getOrSet(
        request.params.userId,
        this._allNodesEntityLabel,
        () => this._nodeManager.getAllNodes(request.params.userId)
      );
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(result);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  getNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const result = await this._nodeManager.getNode(request.params.nodeId);
      const nodeResponse = JSON.parse(result) as NodeResponse;
      const convertedResponse =
        this._transformer.genericNodeConverter(nodeResponse);

      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(convertedResponse);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  copyOrMoveBlock = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'CopyOrMoveBlockRequest');
      const result = await this._nodeManager.moveBlocks(
        requestDetail.data.blockId,
        requestDetail.data.sourceNodeId,
        requestDetail.data.destinationNodeId
      );

      if (result) {
        throw new Error(result);
      }
      response.contentType('application/json').status(statusCodes.NO_CONTENT);
    } catch (error) {
      response.status(statusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
  };
}

export default NodeController;
