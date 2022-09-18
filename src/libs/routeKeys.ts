export const RouteKeys = {
  createNode: 'POST /node',
  getAllNodes: `GET /node/all/{id}`,
  getNode: 'GET /node/{id}',
  appendNode: 'POST /node/{id}/append',
  getArchivedNodes: 'GET /node/archive',
  archiveNode: 'PUT /node/archive/{id}',
  unArchiveNode: 'PUT /node/unarchive',
  deleteArchivedNode: 'POST /node/archive/delete',
  editBlock: 'POST /node/{id}/blockUpdate',
  shorten: 'POST /shorten',
  getShorts: 'GET /{namespace}/stats',
  copyOrMoveBlock: 'PATCH /node/block/movement',
  updateUserPreference: 'POST /user/update',
  createUserPreference: 'POST /user',
  getById: 'GET /user/{userId}',
  getUser: 'GET /user',
  getByGroupId: 'GET /user/group/{groupId}',
  makeNodePublic: 'PATCH /node/makePublic/{id}',
  makeNodePrivate: 'PATCH /node/makePrivate/{id}',
  getPublicNode: 'GET /node/public/{id}',
  getUserByLinkedin: 'POST /user/linkedin',
  getLinkHierarchy: 'GET /workspace/hierarchy',
  getSnippet: 'GET /snippet/{id}',
  getAllVersionsOfSnippet: 'GET /snippet/{id}/all',
  getAllSnippetsOfWorkspace: 'GET /snippet/all',
  createSnippet: 'POST /snippet',
  makeSnippetPublic: 'PATCH /snippet/makePublic/{id}/{version}',
  makeSnippetPrivate: 'PATCH /snippet/makePrivate/{id}/{version}',
  getPublicSnippet: 'GET /snippet/public/{id}/{version}',
  clonePublicSnippet: 'POST /snippet/clone/{id}/{version}',
  createBookmark: 'POST /userBookmark/{userID}/{nodeID}',
  removeBookmark: 'PATCH /userBookmark/{userID}/{nodeID}',
  getAllBookmarks: 'GET /userBookmark/{userID}',
  shareNode: 'POST /shared/node',
  updateAccessTypeForshareNode: 'PUT /shared/node',
  revokeNodeAccessForUsers: 'DELETE /shared/node',
  getNodeSharedWithUser: 'GET /shared/node/{nodeID}',
  updateSharedNode: 'POST /shared/node/update',
  getUsersWithNodesShared: 'GET /shared/node/{id}/users',
  getAllTagsOfWorkspace: 'GET /tag/all',
  getNodeWithTag: 'GET /tag/{tagName}/node',
  refactorHierarchy: 'POST /node/refactor',
  bulkCreateNode: 'POST /node/bulkCreate',
  registerUser: 'POST /user/register',
  getAllSharedNodeForUser: 'GET /shared/node/all',
  createNamespace: 'POST /namespace',
  getNamespace: 'GET /namespace/{id}',
  updateNamespace: 'PATCH /namespace',
  makeNamespacePublic: 'PATCH /namespace/makePublic/{id}',
  makeNamespacePrivate: 'PATCH /namespace/makePrivate/{id}',
  getPublicNamespace: 'GET /namespace/public/{id}',
  getAllNamespaceHierarchy: 'GET /namespace/all/hierarchy'
};
