import express, { Request, Response } from 'express';
import container from '../inversify.config';
import { statusCodes } from '../libs/statusCodes';
import { Transformer } from '../libs/TransformerClass';
import { initializeTagRoutes } from '../routes/TagRoutes';
import { TagManager } from '../managers/TagManager';

class TagController {
  public _urlPath = '/tags';
  public _router = express.Router();
  public _tagManager: TagManager = container.get<TagManager>(TagManager);
  public _transformer: Transformer = container.get<Transformer>(Transformer);

  constructor() {
    initializeTagRoutes(this);
  }

  getAllTagsOfWorkspace = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const result = await this._tagManager.getAllTagsOfWorkspace(
        response.locals.workspaceID,
        response.locals.idToken
      );

      response.json(result);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };

  getNodesWithTag = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    try {
      const tagName = request.params.tagName;
      const result = await this._tagManager.getNodeWithTag(
        response.locals.workspaceID,
        response.locals.idToken,
        tagName
      );

      response.json(result);
    } catch (error) {
      response
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.toString() })
        .json();
    }
  };
}

export default TagController;
