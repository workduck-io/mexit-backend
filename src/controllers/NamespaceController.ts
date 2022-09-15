import express, { NextFunction, Request, Response } from 'express';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { NamespaceManager } from '../managers/NamespaceManager'
import { initializeNamespaceRoutes } from '../routes/NamespaceRoutes'

class NamespaceController {
  public _urlPath = '/namespace';
  public _router = express.Router()
  public _namespaceManager: NamespaceManager = container.get<NamespaceManager>(NamespaceManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);


  constructor() {
    initializeNamespaceRoutes(this);
  }

  createNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const namespaceResult = await this._namespaceManager.createNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        request.body
      )

      console.log(`Namespace Result: ${namespaceResult}`)
      response.status(statusCodes.OK).json(namespaceResult)
    } catch (error) {
      next(error);
    }
  }

  getNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const namespace = await this._namespaceManager.getNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.namespaceID
      )

      const parsedNS = this._transformer.namespaceHierarchyParser(namespace)
      response.status(statusCodes.OK).json(parsedNS)

    } catch (error) {
      next(error);
    }
  }

  renameNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await this._namespaceManager.renameNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        request.body
      )

      response.status(statusCodes.NO_CONTENT)
    } catch (error) {
      next(error);
    }
  }

  makeNamespacePublic = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await this._namespaceManager.makeNamespacePublic(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.namespaceID
      )

      response.status(statusCodes.NO_CONTENT)
    } catch (error) {
      next(error);
    }
  }

  makeNamespacePrivate = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await this._namespaceManager.makeNamespacePrivate(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.namespaceID
      )

      response.status(statusCodes.NO_CONTENT)
    } catch (error) {
      next(error);
    }
  }

  getPublicNamespace = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const publicNamespace = await this._namespaceManager.getPublicNamespace(
        response.locals.workspaceID,
        response.locals.idToken,
        request.params.namespaceID
      )

      const parsedPublicNS = this._transformer.namespaceHierarchyParser(publicNamespace)
      response.status(statusCodes.OK).json(parsedPublicNS)


    } catch (error) {
      next(error);
    }
  }

  getAllNamespaceHierarchy = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const getMetadata = !!request.query['getMetadata']
      const result = await this._namespaceManager.getAllNamespaceHierarchy(
        response.locals.workspaceID,
        response.locals.idToken,
        getMetadata
      )
      const namespaceInfo = getMetadata ? result.hierarchy : result
      const nodesMetadata = getMetadata ? result.nodesMetadata : undefined
      const parsedNamespaceHierarchy = this._transformer.allNamespacesHierarchyParser(namespaceInfo, nodesMetadata)
      response.status(statusCodes.OK).json(parsedNamespaceHierarchy)
    } catch (error) {
      next(error)
    }
  }

}

export default NamespaceController
