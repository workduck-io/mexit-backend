import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { NodeResponse } from '../interfaces/Response';
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
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const createNextVersion = request.query.createNextVersion === 'true';

      const snippetResult = await this._snippetManager.createSnippet(
        response.locals.workspaceID,
        response.locals.idToken,
        request.body,
        createNextVersion
      );
      const deserialisedContent =
        this._transformer.genericNodeConverter(snippetResult);

      response.status(statusCodes.OK).json(deserialisedContent);
    } catch (error) {
      next(error);
    }
  };

  getSnippet = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = (await this._snippetManager.getSnippet(
        request.params.snippetId,
        response.locals.workspaceID,
        response.locals.idToken
      )) as NodeResponse;

      const convertedResponse = this._transformer.genericNodeConverter(result);

      response.status(statusCodes.OK).json(convertedResponse);
    } catch (error) {
      next(error);
    }
  };
  getAllVersionsOfSnippets = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this._snippetManager.getAllVersionsOfSnippet(
        request.params.snippetId,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllSnippetsOfWorkspace = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const getData = request.query.getData === 'true';
      const result = await this._snippetManager.getAllSnippetsOfWorkspace(
        response.locals.workspaceID,
        response.locals.idToken,
        getData
      );

      response.status(statusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  makeSnippetPublic = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const snippetId = request.params.id;
      const version = request.params.version;

      await this._snippetManager.makeSnippetPublic(
        snippetId,
        version,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).send();
    } catch (error) {
      next(error);
    }
  };
  makeSnippetPrivate = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const snippetId = request.params.id;
      const version = request.params.version;

      await this._snippetManager.makeSnippetPrivate(
        snippetId,
        version,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.status(statusCodes.OK).send();
    } catch (error) {
      next(error);
    }
  };

  getPublicSnippet = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const snippetId = request.params.snippetId;
      const version = request.params.version;

      const result = (await this._snippetManager.getPublicSnippet(
        snippetId,
        version,
        response.locals.workspaceID,
        response.locals.idToken
      )) as NodeResponse;

      const convertedResponse = this._transformer.genericNodeConverter(result);

      response.status(statusCodes.OK).json(convertedResponse);
    } catch (error) {
      next(error);
    }
  };

  clonePublicSnippet = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const snippetId = request.params.id;
      const version = request.params.version;

      const result = await this._snippetManager.clonePublicSnippet(
        snippetId,
        version,
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default SnippetController;
