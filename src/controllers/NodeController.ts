import express, { Request, Response } from 'express';
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
import GuidGenerator from '../libs/GuidGenerator';
import linkData from '../linkhierarchy.json';
class NodeController {
  public _urlPath = '/node';
  public _router = express.Router();
  public _nodeManager: NodeManager = container.get<NodeManager>(NodeManager);
  public _shortenerManager: ShortenerManager =
    container.get<ShortenerManager>(ShortenerManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);
  private _cache: Cache = container.get<Cache>(Cache);
  private _linkHierarchyLabel = 'LINKHIERARCHY';
  private _activityNodeLabel = 'ACTIVITYNODE';
  private _defaultActivityBlockCacheSize = 5;

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this._router.post(this._urlPath, [AuthRequest], this.createNode);
    this._router.get(
      `${this._urlPath}/linkhierarchy`,
      [AuthRequest],
      this.getLinkHierarchy
    );
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
    this._router.patch(
      `${this._urlPath}/:id/makePublic`,
      [AuthRequest],
      this.makeNodePublic
    );
    this._router.patch(
      `${this._urlPath}/:id/makePrivate`,
      [AuthRequest],
      this.makeNodePrivate
    );
    this._router.get(`${this._urlPath}/public/:nodeId`, [], this.getPublicNode);
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
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const blockSize =
        parseInt(request.query.blockSize.toString()) < minBlockSizeRequested
          ? minBlockSizeRequested
          : parseInt(request.query.blockSize.toString());
      const userId = response.locals.userId;
      const workspaceId = request.headers['mex-workspace-id'].toString();

      const defaultQueryStringParameters: QueryStringParameters = {
        blockSize: blockSize,
        getMetaDataOfNode: true,
        getReverseOrder: false,
      };

      if (this._cache.has(userId, this._activityNodeLabel)) {
        const cachedResult = await this._cache.get(
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
          const remainingActivityBlocks = JSON.parse(
            await this._nodeManager.getNode(
              `NODE_${userId}`,
              workspaceId,
              response.locals.idToken,
              {
                ...defaultQueryStringParameters,
                blockSize: noOfActivityBlocks,
                ...(cursor && { startCursor: cursor }),
              }
            )
          );

          // Append with the cached blocks from the last
          // used cloneDeep from lodash to clone the object or else it
          // creates a reference to the cache
          const tempCacheStore = _.cloneDeep(cachedResult);
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
          await this._nodeManager.getNode(
            `NODE_${userId}`,
            workspaceId,
            response.locals.idToken,
            defaultQueryStringParameters
          )
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
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send(error.message)
        .json();
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
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');
      // Cognito userId will be the activityNodeid
      const userId = `NODE_${response.locals.userId}`;
      const workspaceIdentifier =
        request.headers['mex-workspace-id'].toString();

      const existingActivityNode = await this._nodeManager.getNode(
        userId,
        workspaceIdentifier,
        response.locals.idToken
      );

      if (!existingActivityNode.message)
        throw new Error('Activity Node exists already');

      const activityNodeDetail: NodeDetail = {
        title: 'activitynode',
        id: userId,
        namespaceIdentifier: '#mex-it',
        data: [],
        lastEditedBy: response.locals.userEmail,
        type: 'NodeRequest',
      };

      const result = JSON.parse(
        await this._nodeManager.createNode(
          workspaceIdentifier,
          response.locals.idToken,
          activityNodeDetail
        )
      ) as NodeResponse;

      this._cache.replaceAndSet(userId, this._activityNodeLabel, result.data);

      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(result);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  newCapture = async (request: Request, response: Response): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');
      const userId = response.locals.userId;
      const reqBody = request.body;
      const type = reqBody.type;
      const defaultQueryStringParameters: QueryStringParameters = {
        blockSize: this._defaultActivityBlockCacheSize,
        getMetaDataOfNode: true,
        getReverseOrder: true,
      };
      const workspaceId = request.headers['mex-workspace-id'].toString();
      switch (type) {
        case 'DRAFT': {
          const activityNodeUID = `NODE_${userId}`;

          const activityNodeDetail = {
            type: 'ElementRequest',
            elements: serializeContent(reqBody.content),
          };

          activityNodeDetail.elements.forEach(e => {
            e.createdBy = response.locals.userEmail;
          });

          // append the blocks to the activity node
          const appendResult = JSON.parse(
            await this._nodeManager.appendNode(
              activityNodeUID,
              workspaceId,
              response.locals.idToken,
              activityNodeDetail
            )
          );

          if (appendResult.message) throw new Error(appendResult.message);

          const updatedNode = JSON.parse(
            await this._nodeManager.getNode(
              activityNodeUID,
              workspaceId,
              response.locals.idToken,
              defaultQueryStringParameters
            )
          );

          if (updatedNode.message) throw new Error(updatedNode.message);
          // append the latest capture into the cache if not already present
          // set the newly created capture
          const updatedCacheNode = this._cache.appendOrCreateActivityNode(
            userId,
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
          const activityNodeUID = `NODE_${userId}`;

          const activityNodeDetail = {
            type: 'ElementRequest',
            elements: serializeContent(reqBody.content),
          };

          activityNodeDetail.elements.forEach(e => {
            e.createdBy = response.locals.userEmail;
          });

          const activityPromise = this._nodeManager.appendNode(
            activityNodeUID,
            workspaceId,
            response.locals.idToken,
            activityNodeDetail
          );

          let hierarchyPromise: Promise<string>;

          if (reqBody.createNodeUID) {
            if (reqBody.createNodeUID === `NODE_${userId}`)
              throw new Error('Cannot create a node using activity node id');

            const nodeDetail = {
              id: reqBody.createNodeUID,
              // nodePath: reqBody.nodePath,
              title: reqBody.title,
              type: 'NodeRequest',
              lastEditedBy: response.locals.userEmail,
              namespaceIdentifier: 'NAMESPACE1',
              data: serializeContent(reqBody.content),
              metadata: reqBody.metadata,
            };

            hierarchyPromise = this._nodeManager.createNode(
              workspaceId,
              response.locals.idToken,
              nodeDetail
            );
          } else if (reqBody.appendNodeUID) {
            if (reqBody.appendNodeUID === `NODE_${userId}`)
              throw new Error('Cannot append to the activity node');
            const appendDetail = {
              type: 'ElementRequest',
              elements: serializeContent(reqBody.content),
            };

            appendDetail.elements.forEach(e => {
              e.createdBy = response.locals.userEmail;
            });

            hierarchyPromise = this._nodeManager.appendNode(
              reqBody.appendNodeUID,
              workspaceId,
              response.locals.idToken,
              appendDetail
            );
          }

          const rawResults = await Promise.all([
            activityPromise,
            hierarchyPromise,
          ]);

          if (JSON.parse(rawResults[0]).message)
            throw new Error(JSON.parse(rawResults[0]).message);
          if (JSON.parse(rawResults[1]).message)
            throw new Error(JSON.parse(rawResults[1]).message);

          const updatedNode = JSON.parse(
            await this._nodeManager.getNode(
              activityNodeUID,
              workspaceId,
              response.locals.idToken,
              defaultQueryStringParameters
            )
          );

          if (updatedNode.message) throw new Error(updatedNode.message);
          // append the latest capture into the cache if not already present
          // set the newly created capture
          const updatedCacheNode = this._cache.appendOrCreateActivityNode(
            userId,
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
      // update the Link hierarchy cache
      await this.updateILinkCache(
        request.params.userId,
        workspaceId,
        response.locals.idToken
      );
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  async updateILinkCache(
    userId: string,
    workspaceId: string,
    idToken: string
  ): Promise<void> {
    if (this._cache.has(userId, this._linkHierarchyLabel)) {
      const result = await this._nodeManager.getLinkHierarchy(
        workspaceId,
        idToken
      );
      this._cache.replaceAndSet(userId, this._linkHierarchyLabel, result);
    }
  }

  createLinkCapture = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');
      const reqBody = new RequestClass(request, 'LinkCapture').data;
      const activityNodeUID = `NODE_${response.locals.userId}`;
      const workspaceId = request.headers['mex-workspace-id'].toString();

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
            id: GuidGenerator.generateBlockGUID(),
            elementType: 'h1',
            createdBy: response.locals.userEmail,
            children: [
              { id: GuidGenerator.generateTempGUID(), content: shortenedURL },
            ],
          },
          {
            id: GuidGenerator.generateBlockGUID(),
            elementType: 'p',
            createdBy: response.locals.userEmail,
            children: [
              {
                id: GuidGenerator.generateTempGUID(),
                content: '',
              },
              {
                id: GuidGenerator.generateTempGUID(),
                elementType: 'a',
                properties: {
                  url: reqBody.long,
                },
                children: [
                  {
                    id: GuidGenerator.generateTempGUID(),
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
        workspaceId,
        response.locals.idToken,
        activityNodeDetail
      );

      const resp = JSON.parse(result);

      // update the Link hierarchy cache
      await this.updateILinkCache(
        request.params.userId,
        workspaceId,
        response.locals.idToken
      );

      if (resp.message) throw new Error(resp.message);

      resp.shortenedURL = shortenedURL;
      response.json(resp);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  createNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ContentNodeRequest');
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();

      if (requestDetail.data.id === `NODE_${response.locals.userId}`)
        throw new Error('Cannot create a node using activitynode id.');

      // const nodeDetail = {
      //   id: requestDetail.data.id,
      //   title: requestDetail.data.title,
      //   type: 'NodeRequest',
      //   lastEditedBy: response.locals.userEmail,
      //   namespaceIdentifier: 'NAMESPACE1',
      //   data: serializeContent(requestDetail.data.content),
      // };

      const nodeResult = await this._nodeManager.createNode(
        workspaceId,
        response.locals.idToken,
        requestDetail.data
      );

      // update the Link hierarchy cache
      await this.updateILinkCache(
        request.params.userId,
        workspaceId,
        response.locals.idToken
      );

      const deserialisedContent = this._transformer.genericNodeConverter(
        JSON.parse(nodeResult)
      );
      response.json(deserialisedContent);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  appendNode = async (request: Request, response: Response): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'ContentNodeRequest');
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();
      if (requestDetail.data.appendNodeUID === `NODE_${response.locals.userId}`)
        throw new Error('Cannot explicitly append to the activitynode.');

      const appendDetail = {
        type: 'ElementRequest',
        elements: serializeContent(requestDetail.data.content),
      };

      appendDetail.elements.forEach(e => {
        e.createdBy = response.locals.userEmail;
      });

      const result = JSON.parse(
        await this._nodeManager.appendNode(
          requestDetail.data.appendNodeUID,
          workspaceId,
          response.locals.idToken,
          appendDetail
        )
      );

      // update the Link hierarchy cache
      await this.updateILinkCache(
        request.params.userId,
        workspaceId,
        response.locals.idToken
      );

      if (result.message) throw new Error(result.message);

      response.json(result);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  getAllNodes = async (request: Request, response: Response): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();
      const result = await this._nodeManager.getAllNodes(
        request.params.userId,
        workspaceId,
        response.locals.idToken
      );

      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(result);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };
  getNode = async (request: Request, response: Response): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();
      const result = await this._nodeManager.getNode(
        request.params.nodeId,
        workspaceId,
        response.locals.idToken
      );

      if (JSON.parse(result).message)
        throw new Error(JSON.parse(result).message);

      const nodeResponse = JSON.parse(result) as NodeResponse;
      // const convertedResponse =
      //   this._transformer.genericNodeConverter(nodeResponse);
      const convertedResponse = nodeResponse;
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(convertedResponse);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };
  copyOrMoveBlock = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const requestDetail = new RequestClass(request, 'CopyOrMoveBlockRequest');
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();
      const result = await this._nodeManager.moveBlocks(
        requestDetail.data.blockId,
        requestDetail.data.sourceNodeId,
        requestDetail.data.destinationNodeId,
        workspaceId,
        response.locals.idToken
      );

      if (result) {
        throw new Error(result);
      }
      response.contentType('application/json').status(statusCodes.NO_CONTENT);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };
  makeNodePublic = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const nodeId = request.params.id;
      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._nodeManager.makeNodePublic(
        nodeId,
        workspaceId,
        response.locals.idToken
      );

      const resp = {
        status: statusCodes.OK,
        nodeUID: JSON.parse(result.body),
      };

      response.json(resp);
    } catch (error) {
      console.error(error);
      response.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  };
  makeNodePrivate = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const nodeId = request.params.id;
      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._nodeManager.makeNodePrivate(
        nodeId,
        workspaceId,
        response.locals.idToken
      );

      const resp = {
        status: statusCodes.OK,
        nodeUID: JSON.parse(result.body),
      };

      response.json(resp);
    } catch (error) {
      console.error(error);
      response.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  };
  getPublicNode = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const nodeId = request.params.nodeId;
      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._nodeManager.getPublicNode(
        nodeId,
        workspaceId,
        response.locals.idToken
      );

      if (JSON.parse(result).message) {
        throw new Error(JSON.parse(result).message);
      }

      const nodeResponse = JSON.parse(result) as NodeResponse;
      const convertedResponse =
        this._transformer.genericNodeConverter(nodeResponse);

      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(convertedResponse);
    } catch (error) {
      const resp = {
        message: error.message,
      };
      response.status(statusCodes.INTERNAL_SERVER_ERROR).json(resp);
    }
  };

  getLinkHierarchy = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('workspace-id header missing');
      const workspaceId = request.headers['mex-workspace-id'].toString();
      const linkDataResult = await this._cache.getOrSet(
        request.params.userId,
        this._linkHierarchyLabel,
        () =>
          this._nodeManager.getLinkHierarchy(
            workspaceId,
            response.locals.idToken
          )
      );

      const result = await this._transformer.decodeLinkHierarchy(
        linkDataResult
      );
      response
        .contentType('application/json')
        .status(statusCodes.OK)
        .send(result);
    } catch (error) {
      console.error(error);
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ errorMsg: error.message })
        .json();
    }
  };
}

export default NodeController;
