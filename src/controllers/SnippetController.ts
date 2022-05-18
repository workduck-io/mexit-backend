import express, { Request, Response } from 'express';
import container from '../inversify.config';
import { RequestClass } from '../libs/RequestClass';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { serializeContent } from '../libs/serialize';
import { NodeResponse } from '../interfaces/Response';
import { NodeDetail } from '../interfaces/Node';
import { SnippetManager } from '../managers/SnippetManager';
import { initializeSnippetRoutes } from '../routes/SnippetRoutes';
class SnippetController {
  public _urlPath = '/snippet';
  public _router = express.Router();
  public _snippetManager: SnippetManager =
    container.get<SnippetManager>(SnippetManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    initializeSnippetRoutes(this);
  }

  createSnippet = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();

      const createNextVersion = request.query.createNextVersion === 'true';

      const nodeResult = await this._snippetManager.createSnippet(
        workspaceId,
        response.locals.idToken,
        request.body,
        createNextVersion
      );

      if (JSON.parse(nodeResult).message) {
        throw new Error(JSON.parse(nodeResult).message);
      }

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

  getSnippet = async (request: Request, response: Response): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();
      const result = await this._snippetManager.getSnippet(
        request.params.snippetId,
        workspaceId,
        response.locals.idToken
      );

      if (result.message) throw new Error(result.message);

      const nodeResponse = JSON.parse(result) as NodeResponse;
      const convertedResponse =
        this._transformer.genericNodeConverter(nodeResponse);

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
  getAllVersionsOfSnippets = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const workspaceId = request.headers['mex-workspace-id'].toString();
      const result = await this._snippetManager.getAllVersionsOfSnippet(
        request.params.snippetId,
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

  makeSnippetPublic = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const snippetId = request.params.id;
      const version = request.params.version;
      const workspaceId = request.headers['mex-workspace-id'].toString();

      await this._snippetManager.makeSnippetPublic(
        snippetId,
        version,
        workspaceId,
        response.locals.idToken
      );

      response.send();
    } catch (error) {
      console.error(error);
      response.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  };
  makeSnippetPrivate = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const snippetId = request.params.id;
      const version = request.params.version;
      const workspaceId = request.headers['mex-workspace-id'].toString();

      await this._snippetManager.makeSnippetPrivate(
        snippetId,
        version,
        workspaceId,
        response.locals.idToken
      );

      response.send();
    } catch (error) {
      console.error(error);
      response.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  };

  getPublicSnippet = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const snippetId = request.params.snippetId;
      const version = request.params.version;
      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._snippetManager.getPublicSnippet(
        snippetId,
        version,
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

  clonePublicSnippet = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      if (!request.headers['mex-workspace-id'])
        throw new Error('mex-workspace-id header missing');

      const snippetId = request.params.id;
      const version = request.params.version;
      const workspaceId = request.headers['mex-workspace-id'].toString();

      const result = await this._snippetManager.clonePublicSnippet(
        snippetId,
        version,
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
}

export default SnippetController;
