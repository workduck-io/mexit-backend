export const RouteKeys = {
  // Node Operations - CRU, Refactor, bulkCreate
  createNode: 'POST /node',
  getNode: 'GET /node/{id}',
  appendNode: 'POST /node/{id}/append',
  editBlock: 'POST /node/{id}/blockUpdate',
  refactorHierarchy: 'POST /node/refactor',
  bulkCreateNode: 'POST /node/bulk',
  copyOrMoveBlock: 'PATCH /node/block/movement',
  makeNodePublic: 'PATCH /node/makePublic/{id}',
  makeNodePrivate: 'PATCH /node/makePrivate/{id}',
  getPublicNode: 'GET /node/public/{id}',

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

  // Snippet Ops
  shareNode: 'POST /shared/node',
  updateAccessTypeForshareNode: 'PUT /shared/node',
  revokeNodeAccessForUsers: 'DELETE /shared/node',
  getNodeSharedWithUser: 'GET /shared/node/{nodeID}',
  updateSharedNode: 'POST /shared/node/update',
  getUsersWithNodesShared: 'GET /shared/node/{id}/users',

  // Snippet Ops
  getSnippet: 'GET /snippet/{id}',
  getAllVersionsOfSnippet: 'GET /snippet/{id}/all',
  getAllSnippetsOfWorkspace: 'GET /snippet/all',
  createSnippet: 'POST /snippet',
  makeSnippetPublic: 'PATCH /snippet/makePublic/{id}/{version}',
  makeSnippetPrivate: 'PATCH /snippet/makePrivate/{id}/{version}',
  getPublicSnippet: 'GET /snippet/public/{id}/{version}',
  clonePublicSnippet: 'POST /snippet/clone/{id}/{version}',

  shorten: 'POST /shorten',
  getShorts: 'GET /{namespace}/stats',
  getUserByLinkedin: 'POST /user/linkedin',
  createBookmark: 'POST /userBookmark/{userID}/{nodeID}',
  removeBookmark: 'PATCH /userBookmark/{userID}/{nodeID}',
  getAllBookmarks: 'GET /userBookmark/{userID}',
  getAllTagsOfWorkspace: 'GET /tag/all',
  getNodeWithTag: 'GET /tag/{tagName}/node',
  getAllSharedNodeForUser: 'GET /shared/node/all',

  // Namespace Ops - CRUD, Fetch Hierarchy
  createNamespace: 'POST /namespace',
  getNamespace: 'GET /namespace/{id}',
  updateNamespace: 'PATCH /namespace',
  makeNamespacePublic: 'PATCH /namespace/makePublic/{id}',
  makeNamespacePrivate: 'PATCH /namespace/makePrivate/{id}',
  getPublicNamespace: 'GET /namespace/public/{id}',
  getAllNamespaceHierarchy: 'GET /namespace/all/hierarchy'
};
