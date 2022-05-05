export const RouteKeys = {
  createNode: 'POST /node',
  getAllNodes: `GET /node/all/{id}`,
  getNode: 'GET /node/{id}',
  appendNode: 'POST /node/{id}/append',
  getArchivedNodes: 'GET /node/archive/{id}',
  archiveNode: 'PUT /node/archive',
  unArchiveNode: 'PUT /node/unarchive',
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
};
