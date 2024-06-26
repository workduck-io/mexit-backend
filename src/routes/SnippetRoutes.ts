import SnippetController from '../controllers/SnippetController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeSnippetRoutes = (snippetObject: SnippetController): void => {
  snippetObject._router.get(`${snippetObject._urlPath}/all`, [AuthRequest], snippetObject.getAllSnippetsOfWorkspace);

  snippetObject._router.post(`${snippetObject._urlPath}/ids`, [AuthRequest], snippetObject.bulkGetSnippet);

  snippetObject._router.get(`${snippetObject._urlPath}/:snippetId`, [AuthRequest], snippetObject.getSnippet);

  snippetObject._router.get(
    `${snippetObject._urlPath}/:snippetId/all`,
    [AuthRequest],
    snippetObject.getAllVersionsOfSnippets
  );

  snippetObject._router.post(snippetObject._urlPath, [AuthRequest], snippetObject.createSnippet);

  snippetObject._router.patch(
    `${snippetObject._urlPath}/:id/:version/makePublic`,
    [AuthRequest],
    snippetObject.makeSnippetPublic
  );

  snippetObject._router.patch(
    `${snippetObject._urlPath}/:id/:version/makePrivate`,
    [AuthRequest],
    snippetObject.makeSnippetPrivate
  );

  snippetObject._router.post(
    `${snippetObject._urlPath}/clone/:id/:version`,
    [AuthRequest],
    snippetObject.clonePublicSnippet
  );

  snippetObject._router.delete(
    `${snippetObject._urlPath}/:id/all`,
    [AuthRequest],
    snippetObject.deleteAllVersionsOfSnippet
  );

  snippetObject._router.delete(`${snippetObject._urlPath}/:id`, [AuthRequest], snippetObject.deleteVersionOfSnippet);

  snippetObject._router.patch(
    `${snippetObject._urlPath}/metadata/:id`,
    [AuthRequest],
    snippetObject.updateSnippetMetadata
  );
};
