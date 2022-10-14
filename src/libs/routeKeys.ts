export const RouteKeys = {
  // Node Operations - CRU, Refactor, bulkCreate
  createNode: 'POST /node',
  getNode: 'GET /node/{id}',
  appendNode: 'PATCH /node/{id}/append',
  refactorHierarchy: 'POST /node/refactor',
  bulkCreateNode: 'POST /node/bulk',
  copyOrMoveBlock: 'PATCH /node/block/movement',
  makeNodePublic: 'PATCH /node/makePublic/{id}',
  makeNodePrivate: 'PATCH /node/makePrivate/{id}',

  // Node Archive Operations
  getArchivedNodes: 'GET /node/archive',
  archiveNode: 'PUT /node/archive/{id}',
  unArchiveNode: 'PUT /node/unarchive',
  deleteArchivedNode: 'POST /node/archive/delete',

  // User Ops
  registerUser: 'POST /user/register',
  getById: 'GET /user/{userId}',
  getUser: 'GET /user',
  getByGroupId: 'GET /user/group/{groupId}',
  updateUserPreference: 'POST /user/update',
  createUserPreference: 'POST /user',
  getUserByLinkedin: 'POST /user/linkedin',

  // Shared Note Ops
  shareNode: 'POST /shared/node',
  updateAccessTypeForshareNode: 'PUT /shared/node',
  revokeNodeAccessForUsers: 'DELETE /shared/node',
  getNodeSharedWithUser: 'GET /shared/node/{nodeID}',
  updateSharedNode: 'POST /shared/node/update',
  getUsersWithNodesShared: 'GET /shared/node/{id}/users',
  getAllSharedNodeForUser: 'GET /shared/node/all',

  // Snippet Ops
  getSnippet: 'GET /snippet/{id}',
  getAllVersionsOfSnippet: 'GET /snippet/{id}/all',
  getAllSnippetsOfWorkspace: 'GET /snippet/all',
  createSnippet: 'POST /snippet',
  makeSnippetPublic: 'PATCH /snippet/makePublic/{id}/{version}',
  makeSnippetPrivate: 'PATCH /snippet/makePrivate/{id}/{version}',
  clonePublicSnippet: 'POST /snippet/clone/{id}/{version}',

  // User Star (Bookmark) Endpoints
  createBookmark: 'POST /userStar/{id}',
  removeBookmark: 'DELETE /userStar/{id}',
  getAllBookmarks: 'GET /userStar/all',
  batchCreateBookmark: 'POST /userStar/batch',
  batchRemoveBookmark: 'DELETE /userStar/batch',

  // Tags Endpoints
  getAllTagsOfWorkspace: 'GET /tag/all',
  getNodeWithTag: 'GET /tag/{tagName}/node',

  // Namespace Ops - CRUD, Fetch Hierarchy
  createNamespace: 'POST /namespace',
  getNamespace: 'GET /namespace/{id}',
  updateNamespace: 'PATCH /namespace',
  makeNamespacePublic: 'PATCH /namespace/makePublic/{id}',
  makeNamespacePrivate: 'PATCH /namespace/makePrivate/{id}',
  getAllNamespaceHierarchy: 'GET /namespace/all/hierarchy',
  getAllNamespaces: 'GET /namespace/all',

  // Views - CRUD Operations
  getAllViews: 'GET /view/all/workspace',
  getView: 'GET /view/{id}',
  deleteView: 'DELETE /view/{id}',
  saveView: 'POST /view',

  // Public Namespace, Node and Snippet Ops
  getPublicNode: 'GET /node/public/{id}',
  getPublicNamespace: 'GET /namespace/public/{id}',
  getPublicSnippet: 'GET /snippet/public/{id}/{version}',

  // Shared Namespaces Roues
  shareNamespace: 'POST /shared/namespace',
  revokeUserAccessFromNamespace: 'DELETE /shared/namespace',
  getUsersOfSharedNamespace: 'GET /shared/namespace/{id}/users',
};
